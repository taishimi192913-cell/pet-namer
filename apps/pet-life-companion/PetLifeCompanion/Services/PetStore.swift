import Foundation
import Network

struct PetStoreSnapshot: Codable, Sendable {
    var hasCompletedOnboarding: Bool
    var pets: [Pet]
    var selectedPetId: String
    var entries: [DiaryEntry]
    var tasks: [CareTask]
    var chatMessages: [ChatMessage]
    var weights: [WeightPoint]
}

enum PersistenceState: Equatable {
    case preparing
    case ready
    case saveFailed(String)

    var userMessage: String? {
        switch self {
        case .preparing:
            return "記録を読み込んでいます"
        case .ready:
            return nil
        case .saveFailed:
            return "端末への保存に失敗しました。入力内容は画面上に残っています。"
        }
    }
}

@MainActor
final class PetStore: ObservableObject {
    @Published var hasCompletedOnboarding: Bool { didSet { save() } }
    @Published var pets: [Pet] { didSet { save() } }
    @Published var selectedPetId: String { didSet { save() } }
    @Published var entries: [DiaryEntry] { didSet { save() } }
    @Published var tasks: [CareTask] { didSet { save() } }
    @Published var chatMessages: [ChatMessage] { didSet { save() } }
    @Published var weights: [WeightPoint] { didSet { save() } }
    @Published private(set) var persistenceState: PersistenceState

    let nameSuggestions: [NameSuggestion]
    private let storageURL: URL?
    private var isLoading = false
    private var pendingSnapshot: PetStoreSnapshot?
    private var saveTask: Task<Void, Never>?
    private static let fallbackPet = Pet(
        id: "fallback",
        name: "うちの子",
        species: .other,
        breed: "未設定",
        sex: .unknown,
        birthday: nil,
        weightKg: 0,
        personality: "最初のプロフィールを登録すると、記録を始められます。",
        lastNote: "",
        nextCare: "",
        palette: .graphite,
        photoSymbolName: "pawprint.fill",
        allergies: "未設定",
        medications: [],
        vetName: "",
        vetPhone: "",
        microchipId: "",
        notes: ""
    )

    init(
        pets: [Pet] = SampleData.pets,
        entries: [DiaryEntry] = SampleData.entries,
        tasks: [CareTask] = SampleData.tasks,
        nameSuggestions: [NameSuggestion] = SampleData.nameSuggestions,
        weights: [WeightPoint] = SampleData.weights,
        hasCompletedOnboarding: Bool = false,
        storageURL: URL? = PetStore.defaultStorageURL,
        resetPersistentStore: Bool = false
    ) {
        if resetPersistentStore, let storageURL {
            try? FileManager.default.removeItem(at: storageURL)
        }

        self.storageURL = storageURL
        self.nameSuggestions = nameSuggestions
        self.hasCompletedOnboarding = hasCompletedOnboarding
        self.pets = pets
        self.selectedPetId = pets.first?.id ?? ""
        self.entries = entries
        self.tasks = tasks
        self.weights = weights
        self.persistenceState = storageURL == nil ? .ready : .preparing
        self.chatMessages = [
            ChatMessage(
                role: .assistant,
                body: "最近の記録を見ながら、病院で伝えることや今日残すとよさそうなメモを一緒に整理します。",
                references: Array(entries.prefix(2))
            )
        ]
        load()
    }

    var selectedPet: Pet {
        pets.first { $0.id == selectedPetId } ?? pets.first ?? Self.fallbackPet
    }

    var selectedEntries: [DiaryEntry] {
        let petId = selectedPet.id
        return entries
            .filter { $0.petId == petId }
            .sorted { $0.date > $1.date }
    }

    var selectedTasks: [CareTask] {
        let petId = selectedPet.id
        return tasks
            .filter { $0.petId == petId && !$0.isDone }
            .sorted { $0.dueDate < $1.dueDate }
    }

    var selectedWeights: [WeightPoint] {
        let petId = selectedPet.id
        return weights
            .filter { $0.petId == petId }
            .sorted { $0.date < $1.date }
    }

    var latestWeightText: String {
        selectedWeights.last.map { "\($0.label) \(String(format: "%.1f", $0.value))kg" } ?? "未記録"
    }

    var recentConcernText: String {
        let symptoms = selectedEntries.filter { $0.category == .symptom }
        guard let first = symptoms.first else {
            return "体調メモはまだ少なめです。いつもと違う様子だけ短く残せば十分です。"
        }
        return "\(first.title)。回数と時間帯を続けて残すと、病院で説明しやすくなります。"
    }

    func selectPet(_ pet: Pet) {
        selectedPetId = pet.id
        chatMessages = [
            ChatMessage(
                role: .assistant,
                body: "\(pet.name)の記録を見ながら、気になる変化や病院前メモを整理できます。",
                references: Array(selectedEntries.prefix(2))
            )
        ]
    }

    func addQuickEntry(
        category: DiaryCategory,
        title: String,
        note: String,
        amount: Double? = nil,
        unit: String? = nil,
        severity: Int? = nil
    ) {
        let trimmed = note.trimmingCharacters(in: .whitespacesAndNewlines)
        let safeTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty || !safeTitle.isEmpty else { return }

        entries.insert(
            DiaryEntry(
                id: UUID(),
                petId: selectedPetId,
                date: Date(),
                category: category,
                title: safeTitle.isEmpty ? category.rawValue : safeTitle,
                body: trimmed.isEmpty ? "30秒記録から追加" : trimmed,
                tag: category.rawValue,
                amount: amount,
                unit: unit,
                severity: severity,
                photoAttachmentName: nil
            ),
            at: 0
        )
    }

    func completeOnboarding(
        name: String,
        species: PetSpecies,
        breed: String,
        sex: PetSex,
        trackedCategories: Set<DiaryCategory>
    ) {
        let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        let trimmedBreed = breed.trimmingCharacters(in: .whitespacesAndNewlines)
        let petName = trimmedName.isEmpty ? "うちの子" : trimmedName
        let petId = UUID().uuidString
        let pet = Pet(
            id: petId,
            name: petName,
            species: species,
            breed: trimmedBreed.isEmpty ? species.rawValue : trimmedBreed,
            sex: sex,
            birthday: nil,
            weightKg: 0,
            personality: "",
            lastNote: "今日から記録を始めます。",
            nextCare: "最初の記録を追加",
            palette: palette(for: species),
            photoSymbolName: species.symbolName,
            allergies: "未設定",
            medications: [],
            vetName: "",
            vetPhone: "",
            microchipId: "",
            notes: ""
        )

        pets = [pet]
        selectedPetId = petId
        entries = []
        weights = []
        tasks = starterTasks(for: petId, trackedCategories: trackedCategories)
        chatMessages = [
            ChatMessage(
                role: .assistant,
                body: "\(petName)の記録を始めました。ごはん、体調、通院前メモを短く残していくと、変化に気づきやすくなります。"
            )
        ]
        hasCompletedOnboarding = true
    }

    func previewWithSampleData() {
        hasCompletedOnboarding = true
    }

    func addWeight(_ value: Double, date: Date = Date()) {
        weights.append(WeightPoint(petId: selectedPetId, date: date, value: value))
        if let index = pets.firstIndex(where: { $0.id == selectedPetId }) {
            pets[index].weightKg = value
        }
    }

    func completeTask(_ task: CareTask, completedAt: Date = Date()) {
        guard let index = tasks.firstIndex(where: { $0.id == task.id }) else { return }
        tasks[index].completedAt = completedAt

        guard let nextDate = task.repeatRule.nextDate(after: completedAt) else { return }
        let nextTask = CareTask(
            id: UUID(),
            petId: task.petId,
            title: task.title,
            dueDate: nextDate,
            category: task.category,
            repeatRule: task.repeatRule,
            completedAt: nil
        )
        tasks.append(nextTask)
    }

    func sendPrompt(_ prompt: String) {
        let trimmed = prompt.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        chatMessages.append(ChatMessage(role: .user, body: trimmed))
        let reply = PetAssistantService.reply(
            pet: selectedPet,
            message: trimmed,
            recentEntries: selectedEntries
        )
        chatMessages.append(reply)
    }

    func vetMemo(days: Int = 7) -> String {
        PetAssistantService.vetMemo(
            pet: selectedPet,
            entries: selectedEntries,
            tasks: tasks,
            weights: selectedWeights,
            days: days
        )
    }

    private static var defaultStorageURL: URL? {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?
            .appendingPathComponent("pet-life-companion.json")
    }

    private func load() {
        guard let storageURL, FileManager.default.fileExists(atPath: storageURL.path) else {
            persistenceState = .ready
            return
        }
        isLoading = true
        Task {
            let result = await Task.detached(priority: .userInitiated) {
                do {
                    let data = try Data(contentsOf: storageURL)
                    return Result<PetStoreSnapshot, Error>.success(try JSONDecoder().decode(PetStoreSnapshot.self, from: data))
                } catch {
                    return Result<PetStoreSnapshot, Error>.failure(error)
                }
            }.value

            switch result {
            case .success(let snapshot):
                hasCompletedOnboarding = snapshot.hasCompletedOnboarding
                pets = snapshot.pets
                selectedPetId = snapshot.selectedPetId
                entries = snapshot.entries
                tasks = snapshot.tasks
                chatMessages = snapshot.chatMessages
                weights = snapshot.weights
                persistenceState = .ready
            case .failure:
                persistenceState = .ready
            }
            isLoading = false
        }
    }

    private func save() {
        guard !isLoading, let storageURL else { return }
        pendingSnapshot = PetStoreSnapshot(
            hasCompletedOnboarding: hasCompletedOnboarding,
            pets: pets,
            selectedPetId: selectedPetId,
            entries: entries,
            tasks: tasks,
            chatMessages: chatMessages,
            weights: weights
        )

        guard saveTask == nil else { return }
        saveTask = Task { [weak self] in
            await self?.drainPendingSaves(to: storageURL)
        }
    }

    private func drainPendingSaves(to storageURL: URL) async {
        while let snapshot = pendingSnapshot {
            pendingSnapshot = nil
            let didSave = await Task.detached(priority: .utility) {
                do {
                    let data = try JSONEncoder().encode(snapshot)
                    try FileManager.default.createDirectory(
                        at: storageURL.deletingLastPathComponent(),
                        withIntermediateDirectories: true,
                        attributes: [.protectionKey: FileProtectionType.complete]
                    )
                    try data.write(to: storageURL, options: [.atomic, .completeFileProtection])
                    return true
                } catch {
                    return false
                }
            }.value

            if didSave {
                if pendingSnapshot == nil {
                    persistenceState = .ready
                }
            } else {
                persistenceState = .saveFailed("local-persistence")
            }
        }
        saveTask = nil

        if pendingSnapshot != nil {
            save()
        }
    }

    private func palette(for species: PetSpecies) -> PetPalette {
        switch species {
        case .dog: .amber
        case .cat: .blue
        case .other: .graphite
        }
    }

    private func starterTasks(for petId: String, trackedCategories: Set<DiaryCategory>) -> [CareTask] {
        let now = Date()
        var tasks: [CareTask] = [
            CareTask(
                id: UUID(),
                petId: petId,
                title: "今日の様子を記録",
                dueDate: now,
                category: .record,
                repeatRule: .daily,
                completedAt: nil
            )
        ]

        if trackedCategories.contains(.medicine) {
            tasks.append(
                CareTask(
                    id: UUID(),
                    petId: petId,
                    title: "薬・サプリの確認",
                    dueDate: now,
                    category: .medicine,
                    repeatRule: .daily,
                    completedAt: nil
                )
            )
        }

        if trackedCategories.contains(.vet) || trackedCategories.contains(.symptom) {
            tasks.append(
                CareTask(
                    id: UUID(),
                    petId: petId,
                    title: "病院で伝えるメモを整理",
                    dueDate: now,
                    category: .vet,
                    repeatRule: .none,
                    completedAt: nil
                )
            )
        }

        return tasks
    }
}

@MainActor
final class NetworkStatusMonitor: ObservableObject {
    @Published private(set) var isOnline = true

    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "PetLifeCompanion.NetworkStatus")

    init() {
        monitor.pathUpdateHandler = { [weak self] path in
            let isOnline = path.status == .satisfied
            Task { @MainActor in
                self?.isOnline = isOnline
            }
        }
        monitor.start(queue: queue)
    }

    deinit {
        monitor.cancel()
    }
}
