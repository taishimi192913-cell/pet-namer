import Foundation

enum PetAssistantService {
    static func reply(pet: Pet, message: String, recentEntries: [DiaryEntry]) -> ChatMessage {
        let references = relevantEntries(for: message, from: recentEntries)
        let symptomCount = recentEntries.filter { $0.category == .symptom }.reduce(0) { total, entry in
            total + Int(entry.amount ?? 1)
        }
        let foodEntries = recentEntries.filter { $0.category == .food }
        let latest = recentEntries.first?.title ?? "直近の記録はまだ少なめです"
        let caution = urgentCareCopy(for: message)

        let foodSummary: String
        if let food = foodEntries.first {
            foodSummary = "ごはん記録は\(food.title)\(food.metricText.map { "（\($0)）" } ?? "")"
        } else {
            foodSummary = "食事量の記録が少ないため、量と残し方を続けて残すと判断材料になります。"
        }

        let body = """
        要約
        \(pet.name)の直近メモでは「\(latest)」が目立ちます。\(foodSummary)

        気になる変化
        直近の体調メモは\(symptomCount)回分あります。時間帯、回数、食欲、水分、元気さを同じ形式で残すと変化を追いやすくなります。

        病院で伝えること
        いつから、何回、食欲と水分、薬の有無、普段との違いを短く伝えられるようにしましょう。これは診断ではありません。

        次に記録するとよいこと
        食事量、症状の回数、散歩や排泄、写真を1つずつ追加してください。\(caution)
        """

        return ChatMessage(role: .assistant, body: body, references: references)
    }

    static func vetMemo(
        pet: Pet,
        entries: [DiaryEntry],
        tasks: [CareTask],
        weights: [WeightPoint],
        days: Int
    ) -> String {
        let cutoffDate = Calendar.current.date(
            byAdding: .day,
            value: -max(days, 1),
            to: Date()
        ) ?? .distantPast
        let recentEntries = entries
            .filter { $0.petId == pet.id && $0.date >= cutoffDate }
            .sorted { $0.date > $1.date }
        let recentWeights = weights
            .filter { $0.petId == pet.id && $0.date >= cutoffDate }
            .sorted { $0.date > $1.date }
        let pendingTasks = tasks
            .filter { $0.petId == pet.id && !$0.isDone }
            .sorted { $0.dueDate < $1.dueDate }

        let symptomLines = recentEntries
            .filter { $0.category == .symptom }
            .prefix(4)
            .map { "- \($0.timeText): \($0.title) \($0.metricText.map { "(\($0))" } ?? "")" }
            .joined(separator: "\n")
        let foodLines = recentEntries
            .filter { $0.category == .food || $0.category == .medicine }
            .prefix(4)
            .map { "- \($0.timeText): \($0.title) \($0.metricText.map { "(\($0))" } ?? "")" }
            .joined(separator: "\n")
        let weightLine = recentWeights.first.map { "\($0.label) \(String(format: "%.1f", $0.value))kg" } ?? "未記録"
        let taskLines = pendingTasks.prefix(4).map { "- \($0.title): \($0.dueText)" }.joined(separator: "\n")

        return """
        \(pet.name)の通院メモ（直近\(days)日間）
        診断ではなく、飼い主の記録整理です。

        基本情報
        \(pet.species.rawValue) / \(pet.breed) / \(pet.ageText) / \(pet.weightText)
        性格メモ: \(pet.personality)
        アレルギー: \(pet.allergies)
        薬: \(pet.medications.isEmpty ? "なし" : pet.medications.joined(separator: "、"))

        体重
        \(weightLine)

        食事・薬
        \(foodLines.isEmpty ? "- 記録なし" : foodLines)

        症状・気になる変化
        \(symptomLines.isEmpty ? "- 記録なし" : symptomLines)

        未完了の予定
        \(taskLines.isEmpty ? "- なし" : taskLines)
        """
    }

    private static func relevantEntries(for message: String, from entries: [DiaryEntry]) -> [DiaryEntry] {
        let category: DiaryCategory?
        if message.contains("食欲") || message.contains("ごはん") {
            category = .food
        } else if message.contains("咳") || message.contains("吐") || message.contains("体調") {
            category = .symptom
        } else if message.contains("薬") {
            category = .medicine
        } else {
            category = nil
        }

        let sorted = entries.sorted { $0.date > $1.date }
        if let category {
            let filtered = sorted.filter { $0.category == category }
            return filtered.isEmpty ? Array(sorted.prefix(3)) : Array(filtered.prefix(3))
        }
        return Array(sorted.prefix(3))
    }

    private static func urgentCareCopy(for message: String) -> String {
        let urgentWords = ["急変", "呼吸困難", "ぐったり", "血", "繰り返す嘔吐"]
        if urgentWords.contains(where: { message.contains($0) }) {
            return "急変、呼吸困難、ぐったり、血が混じる、繰り返す嘔吐がある場合は早めに獣医師へ相談してください。"
        }
        return "気になる症状が続く場合は獣医師に相談してください。"
    }
}
