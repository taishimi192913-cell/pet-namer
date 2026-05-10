import XCTest
@testable import PetLifeCompanion

final class PetAssistantServiceTests: XCTestCase {
    func testVetPromptIncludesNonDiagnosticCopyAndReferences() {
        let pet = SampleData.pets[0]
        let entries = SampleData.entries.filter { $0.petId == pet.id }

        let reply = PetAssistantService.reply(
            pet: pet,
            message: "病院で伝えることをまとめて",
            recentEntries: entries
        )

        XCTAssertEqual(reply.role, .assistant)
        XCTAssertTrue(reply.body.contains("診断ではありません"))
        XCTAssertFalse(reply.references.isEmpty)
    }

    func testFoodPromptUsesFoodSpecificCopy() {
        let pet = SampleData.pets[0]
        let entries = SampleData.entries.filter { $0.petId == pet.id }

        let reply = PetAssistantService.reply(
            pet: pet,
            message: "最近の食欲について見て",
            recentEntries: entries
        )

        XCTAssertTrue(reply.body.contains("ごはん記録"))
        XCTAssertTrue(reply.references.allSatisfy { $0.category == .food })
    }

    func testAssistantReplyUsesStructuredVetMemoSections() {
        let pet = SampleData.pets[0]
        let entries = SampleData.entries.filter { $0.petId == pet.id }

        let reply = PetAssistantService.reply(
            pet: pet,
            message: "咳が続いていて病院で伝えることをまとめて",
            recentEntries: entries
        )

        XCTAssertTrue(reply.body.contains("要約"))
        XCTAssertTrue(reply.body.contains("気になる変化"))
        XCTAssertTrue(reply.body.contains("病院で伝えること"))
        XCTAssertTrue(reply.body.contains("次に記録するとよいこと"))
        XCTAssertTrue(reply.body.contains("診断ではありません"))
        XCTAssertFalse(reply.references.isEmpty)
    }

    func testVetMemoContainsPeriodAndNonDiagnosticDisclaimer() {
        let pet = SampleData.pets[0]
        let entries = SampleData.entries.filter { $0.petId == pet.id }
        let tasks = SampleData.tasks.filter { $0.petId == pet.id }
        let weights = SampleData.weights.filter { $0.petId == pet.id }

        let memo = PetAssistantService.vetMemo(
            pet: pet,
            entries: entries,
            tasks: tasks,
            weights: weights,
            days: 7
        )

        XCTAssertTrue(memo.contains("7日間"))
        XCTAssertTrue(memo.contains("診断ではなく、飼い主の記録整理です"))
        XCTAssertTrue(memo.contains("体重"))
        XCTAssertTrue(memo.contains("未完了"))
    }

    func testVetMemoExcludesRecordsOutsideRequestedPeriod() throws {
        let pet = SampleData.pets[0]
        let recentDate = Date()
        let oldDate = try XCTUnwrap(Calendar.current.date(byAdding: .day, value: -14, to: recentDate))
        let entries = [
            DiaryEntry(
                id: UUID(),
                petId: pet.id,
                date: recentDate,
                category: .symptom,
                title: "今週の咳",
                body: "",
                tag: "",
                amount: 1,
                unit: "回",
                severity: nil,
                photoAttachmentName: nil
            ),
            DiaryEntry(
                id: UUID(),
                petId: pet.id,
                date: oldDate,
                category: .symptom,
                title: "古い咳",
                body: "",
                tag: "",
                amount: 3,
                unit: "回",
                severity: nil,
                photoAttachmentName: nil
            )
        ]
        let weights = [
            WeightPoint(petId: pet.id, date: oldDate, value: 7.1),
            WeightPoint(petId: pet.id, date: recentDate, value: 8.2)
        ]

        let memo = PetAssistantService.vetMemo(
            pet: pet,
            entries: entries,
            tasks: [],
            weights: weights,
            days: 7
        )

        XCTAssertTrue(memo.contains("今週の咳"))
        XCTAssertFalse(memo.contains("古い咳"))
        XCTAssertTrue(memo.contains("8.2kg"))
        XCTAssertFalse(memo.contains("7.1kg"))
    }

    @MainActor
    func testCompletingRepeatingTaskRecordsActualDateAndCreatesNextTask() throws {
        let calendar = Calendar(identifier: .gregorian)
        let dueDate = try XCTUnwrap(calendar.date(from: DateComponents(year: 2026, month: 5, day: 10, hour: 8)))
        let completedAt = try XCTUnwrap(calendar.date(from: DateComponents(year: 2026, month: 5, day: 11, hour: 21)))
        let task = CareTask(
            id: UUID(),
            petId: "mugi",
            title: "フィラリア薬",
            dueDate: dueDate,
            category: .medicine,
            repeatRule: .monthly,
            completedAt: nil
        )
        let store = PetStore(
            pets: SampleData.pets,
            entries: SampleData.entries,
            tasks: [task],
            nameSuggestions: [],
            weights: SampleData.weights,
            storageURL: nil
        )

        store.completeTask(task, completedAt: completedAt)

        XCTAssertTrue(store.tasks.contains { $0.id == task.id && $0.completedAt == completedAt })
        XCTAssertTrue(store.tasks.contains { $0.id != task.id && $0.dueDate > completedAt && $0.repeatRule == .monthly })
    }

    @MainActor
    func testWeightsAreScopedToSelectedPet() {
        let store = PetStore(
            pets: SampleData.pets,
            entries: SampleData.entries,
            tasks: SampleData.tasks,
            nameSuggestions: [],
            weights: SampleData.weights,
            storageURL: nil
        )

        XCTAssertTrue(store.selectedWeights.allSatisfy { $0.petId == store.selectedPetId })
    }

    @MainActor
    func testCompletingOnboardingCreatesRealPetAndClearsSampleRecords() {
        let store = PetStore(
            pets: SampleData.pets,
            entries: SampleData.entries,
            tasks: SampleData.tasks,
            nameSuggestions: [],
            weights: SampleData.weights,
            storageURL: nil
        )

        store.completeOnboarding(
            name: "こむぎ",
            species: .dog,
            breed: "トイプードル",
            sex: .female,
            trackedCategories: [.food, .symptom, .medicine, .walk]
        )

        XCTAssertTrue(store.hasCompletedOnboarding)
        XCTAssertEqual(store.pets.count, 1)
        XCTAssertEqual(store.selectedPet.name, "こむぎ")
        XCTAssertEqual(store.selectedPet.breed, "トイプードル")
        XCTAssertEqual(store.entries.count, 0)
        XCTAssertEqual(store.weights.count, 0)
        XCTAssertTrue(store.tasks.allSatisfy { $0.petId == store.selectedPet.id })
        XCTAssertTrue(store.chatMessages.first?.body.contains("こむぎ") == true)
    }

    @MainActor
    func testPreviewWithSampleDataMarksOnboardingCompleteWithoutClearingSamples() {
        let store = PetStore(
            pets: SampleData.pets,
            entries: SampleData.entries,
            tasks: SampleData.tasks,
            nameSuggestions: [],
            weights: SampleData.weights,
            storageURL: nil
        )

        store.previewWithSampleData()

        XCTAssertTrue(store.hasCompletedOnboarding)
        XCTAssertEqual(store.pets.count, SampleData.pets.count)
        XCTAssertEqual(store.entries.count, SampleData.entries.count)
    }

    @MainActor
    func testEmptyPetListUsesSafeFallbackPetInsteadOfCrashing() {
        let store = PetStore(
            pets: [],
            entries: [],
            tasks: [],
            nameSuggestions: [],
            weights: [],
            storageURL: nil
        )

        XCTAssertEqual(store.selectedPet.name, "うちの子")
        XCTAssertEqual(store.selectedPet.species, .other)
        XCTAssertTrue(store.selectedEntries.isEmpty)
        XCTAssertTrue(store.selectedTasks.isEmpty)
        XCTAssertEqual(store.latestWeightText, "未記録")
    }

    @MainActor
    func testStaleSelectedPetIdFallsBackToFirstPetForScopedData() {
        let store = PetStore(
            pets: SampleData.pets,
            entries: SampleData.entries,
            tasks: SampleData.tasks,
            nameSuggestions: [],
            weights: SampleData.weights,
            storageURL: nil
        )

        store.selectedPetId = "deleted-pet"

        XCTAssertEqual(store.selectedPet.id, SampleData.pets[0].id)
        XCTAssertTrue(store.selectedEntries.allSatisfy { $0.petId == store.selectedPet.id })
        XCTAssertTrue(store.selectedTasks.allSatisfy { $0.petId == store.selectedPet.id })
        XCTAssertTrue(store.selectedWeights.allSatisfy { $0.petId == store.selectedPet.id })
        XCTAssertNotEqual(store.latestWeightText, "未記録")
    }
}
