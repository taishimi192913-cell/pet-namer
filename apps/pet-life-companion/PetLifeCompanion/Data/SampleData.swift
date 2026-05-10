import Foundation

enum SampleData {
    private static let calendar = Calendar(identifier: .gregorian)

    private static func date(_ year: Int, _ month: Int, _ day: Int, _ hour: Int = 9, _ minute: Int = 0) -> Date {
        calendar.date(from: DateComponents(year: year, month: month, day: day, hour: hour, minute: minute)) ?? Date()
    }

    static let pets: [Pet] = [
        Pet(
            id: "mugi",
            name: "むぎ",
            species: .dog,
            breed: "柴犬",
            sex: .male,
            birthday: date(2023, 1, 8),
            weightKg: 8.6,
            personality: "人見知りだけど、家ではよく話を聞く。雨の日は少し緊張しやすい。",
            lastNote: "朝は食欲あり。雨で散歩は短め。",
            nextCare: "フィラリア薬まで5日",
            palette: .amber,
            photoSymbolName: "dog.fill",
            allergies: "鶏肉で少し皮膚が赤くなりやすい",
            medications: ["フィラリア薬 月1回", "整腸サプリ 朝"],
            vetName: "青山どうぶつクリニック",
            vetPhone: "03-0000-0000",
            microchipId: "392141000000001",
            notes: "診察では咳の回数と食欲を先に伝える"
        ),
        Pet(
            id: "suzu",
            name: "すず",
            species: .cat,
            breed: "ミックス",
            sex: .female,
            birthday: date(2023, 9, 15),
            weightKg: 4.1,
            personality: "甘えたい時だけ近くに来る。環境の変化には敏感。",
            lastNote: "夜に少し吐き戻し。水は飲めている。",
            nextCare: "爪切りを週末に確認",
            palette: .blue,
            photoSymbolName: "cat.fill",
            allergies: "未確認",
            medications: [],
            vetName: "青山どうぶつクリニック",
            vetPhone: "03-0000-0000",
            microchipId: "",
            notes: "吐き戻しは毛玉か食後すぐかを分けて記録"
        )
    ]

    static let entries: [DiaryEntry] = [
        DiaryEntry(id: UUID(), petId: "mugi", date: date(2026, 5, 4, 7, 40), category: .food, title: "朝ごはんは完食", body: "いつものフードを落ち着いて食べた。薬はチーズに包むと嫌がらなかった。", tag: "食欲あり", amount: 42, unit: "g", severity: nil, photoAttachmentName: nil),
        DiaryEntry(id: UUID(), petId: "mugi", date: date(2026, 5, 4, 8, 15), category: .walk, title: "雨の合間に短め散歩", body: "濡れた道を少し嫌がったので短め。帰宅後は足を拭いてよく寝ている。", tag: "雨の日", amount: 18, unit: "分", severity: nil, photoAttachmentName: nil),
        DiaryEntry(id: UUID(), petId: "mugi", date: date(2026, 5, 3, 21, 10), category: .symptom, title: "夜だけ少し咳", body: "寝る前に2回。朝は普段通り。続くようなら病院メモに入れる。", tag: "様子を見る", amount: 2, unit: "回", severity: 2, photoAttachmentName: nil),
        DiaryEntry(id: UUID(), petId: "mugi", date: date(2026, 5, 3, 8, 0), category: .medicine, title: "整腸サプリ", body: "朝ごはんと一緒に投与。嫌がらず飲めた。", tag: "投与済み", amount: 1, unit: "回", severity: nil, photoAttachmentName: nil),
        DiaryEntry(id: UUID(), petId: "suzu", date: date(2026, 5, 4, 6, 50), category: .symptom, title: "吐き戻しを1回", body: "毛玉らしきもの。水は飲めていて、朝は少量だけ食べた。", tag: "メモ", amount: 1, unit: "回", severity: 2, photoAttachmentName: nil),
        DiaryEntry(id: UUID(), petId: "suzu", date: date(2026, 5, 3, 19, 30), category: .photo, title: "窓辺で長く寝ていた", body: "夕方の光が入る場所。いつもの毛布で落ち着いていた。", tag: "思い出", amount: nil, unit: nil, severity: nil, photoAttachmentName: "sofa")
    ]

    static let tasks: [CareTask] = [
        CareTask(id: UUID(), petId: "mugi", title: "混合ワクチンの確認", dueDate: date(2026, 5, 16, 10, 0), category: .vaccine, repeatRule: .none, completedAt: nil),
        CareTask(id: UUID(), petId: "mugi", title: "フィラリア薬", dueDate: date(2026, 5, 10, 8, 0), category: .medicine, repeatRule: .monthly, completedAt: nil),
        CareTask(id: UUID(), petId: "suzu", title: "爪切り", dueDate: date(2026, 5, 11, 18, 0), category: .grooming, repeatRule: .weekly, completedAt: nil),
        CareTask(id: UUID(), petId: "suzu", title: "体重を測る", dueDate: date(2026, 5, 5, 20, 0), category: .record, repeatRule: .weekly, completedAt: nil)
    ]

    static let nameSuggestions: [NameSuggestion] = [
        NameSuggestion(name: "むぎ", petType: "犬", tone: "やわらかい、呼びやすい", reason: "毛色や穏やかな性格に合わせやすく、家族で呼び続けやすい名前です。"),
        NameSuggestion(name: "こはく", petType: "猫", tone: "落ち着いた、少し上品", reason: "瞳や毛色の印象を名前に残せます。成長しても違和感が出にくいです。")
    ]

    static let weights: [WeightPoint] = [
        WeightPoint(petId: "mugi", date: date(2026, 4, 6), value: 8.4),
        WeightPoint(petId: "mugi", date: date(2026, 4, 13), value: 8.5),
        WeightPoint(petId: "mugi", date: date(2026, 4, 20), value: 8.5),
        WeightPoint(petId: "mugi", date: date(2026, 4, 27), value: 8.6),
        WeightPoint(petId: "mugi", date: date(2026, 5, 4), value: 8.6),
        WeightPoint(petId: "suzu", date: date(2026, 4, 6), value: 4.0),
        WeightPoint(petId: "suzu", date: date(2026, 4, 20), value: 4.1),
        WeightPoint(petId: "suzu", date: date(2026, 5, 4), value: 4.1)
    ]
}
