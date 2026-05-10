import Foundation
import SwiftUI

enum PetSpecies: String, Codable, CaseIterable, Identifiable, Sendable {
    case dog = "犬"
    case cat = "猫"
    case other = "その他"

    var id: String { rawValue }

    var symbolName: String {
        switch self {
        case .dog: "dog.fill"
        case .cat: "cat.fill"
        case .other: "pawprint.fill"
        }
    }
}

enum PetSex: String, Codable, CaseIterable, Identifiable, Sendable {
    case female = "女の子"
    case male = "男の子"
    case unknown = "未設定"

    var id: String { rawValue }
}

enum PetPalette: String, Codable, Sendable {
    case amber
    case blue
    case rose
    case graphite

    var color: Color {
        switch self {
        case .amber: Color("PetAmber")
        case .blue: Color("PetBlue")
        case .rose: Color("PetRose")
        case .graphite: Color("PetGraphite")
        }
    }
}

struct Pet: Identifiable, Codable, Equatable, Sendable {
    var id: String
    var name: String
    var species: PetSpecies
    var breed: String
    var sex: PetSex
    var birthday: Date?
    var weightKg: Double
    var personality: String
    var lastNote: String
    var nextCare: String
    var palette: PetPalette
    var photoSymbolName: String?
    var allergies: String
    var medications: [String]
    var vetName: String
    var vetPhone: String
    var microchipId: String
    var notes: String

    var ageText: String {
        guard let birthday else { return "年齢未設定" }
        let components = Calendar.current.dateComponents([.year, .month], from: birthday, to: Date())
        let years = components.year ?? 0
        let months = components.month ?? 0
        if years > 0 {
            return "\(years)歳\(months)か月"
        }
        return "\(max(months, 1))か月"
    }

    var weightText: String {
        String(format: "%.1fkg", weightKg)
    }

    var symbolName: String {
        photoSymbolName ?? species.symbolName
    }

    var tint: Color {
        palette.color
    }
}

enum DiaryCategory: String, Codable, CaseIterable, Identifiable, Sendable {
    case food = "ごはん"
    case medicine = "くすり"
    case toilet = "トイレ"
    case symptom = "体調"
    case walk = "散歩"
    case photo = "写真"
    case vet = "病院"
    case note = "メモ"

    var id: String { rawValue }

    var iconName: String {
        switch self {
        case .food: "fork.knife"
        case .medicine: "pills.fill"
        case .toilet: "drop.fill"
        case .symptom: "cross.case.fill"
        case .walk: "figure.walk"
        case .photo: "camera.fill"
        case .vet: "stethoscope"
        case .note: "note.text"
        }
    }
}

struct DiaryEntry: Identifiable, Codable, Equatable, Sendable {
    var id: UUID
    var petId: String
    var date: Date
    var category: DiaryCategory
    var title: String
    var body: String
    var tag: String
    var amount: Double?
    var unit: String?
    var severity: Int?
    var photoAttachmentName: String?

    var timeText: String {
        date.formatted(.dateTime.month().day().hour().minute())
    }

    var categoryLabel: String {
        category.rawValue
    }

    var metricText: String? {
        if let amount, let unit {
            let formatted = amount.rounded() == amount ? String(format: "%.0f", amount) : String(format: "%.1f", amount)
            return "\(formatted)\(unit)"
        }
        if let severity {
            return "強さ \(severity)/5"
        }
        return nil
    }
}

enum TaskCategory: String, Codable, CaseIterable, Identifiable, Sendable {
    case medicine = "薬"
    case vaccine = "ワクチン"
    case vet = "通院"
    case grooming = "お世話"
    case record = "記録"

    var id: String { rawValue }

    var iconName: String {
        switch self {
        case .medicine: "pills.fill"
        case .vaccine: "syringe.fill"
        case .vet: "stethoscope"
        case .grooming: "scissors"
        case .record: "chart.line.uptrend.xyaxis"
        }
    }
}

enum RepeatRule: String, Codable, CaseIterable, Identifiable, Sendable {
    case none = "なし"
    case daily = "毎日"
    case weekly = "毎週"
    case monthly = "毎月"

    var id: String { rawValue }

    func nextDate(after date: Date) -> Date? {
        let calendar = Calendar.current
        switch self {
        case .none:
            return nil
        case .daily:
            return calendar.date(byAdding: .day, value: 1, to: date)
        case .weekly:
            return calendar.date(byAdding: .day, value: 7, to: date)
        case .monthly:
            return calendar.date(byAdding: .month, value: 1, to: date)
        }
    }
}

struct CareTask: Identifiable, Codable, Equatable, Sendable {
    var id: UUID
    var petId: String
    var title: String
    var dueDate: Date
    var category: TaskCategory
    var repeatRule: RepeatRule
    var completedAt: Date?

    var isDone: Bool {
        completedAt != nil
    }

    var dueText: String {
        dueDate.formatted(.dateTime.month().day().hour().minute())
    }
}

struct NameSuggestion: Identifiable, Codable, Equatable, Sendable {
    var id = UUID()
    var name: String
    var petType: String
    var tone: String
    var reason: String
}

struct ChatMessage: Identifiable, Codable, Equatable, Sendable {
    enum Role: String, Codable, Sendable {
        case user
        case assistant
    }

    var id: UUID
    var role: Role
    var body: String
    var references: [DiaryEntry]

    init(id: UUID = UUID(), role: Role, body: String, references: [DiaryEntry] = []) {
        self.id = id
        self.role = role
        self.body = body
        self.references = references
    }
}

struct WeightPoint: Identifiable, Codable, Equatable, Sendable {
    var id = UUID()
    var petId: String
    var date: Date
    var value: Double

    var label: String {
        date.formatted(.dateTime.month().day())
    }
}
