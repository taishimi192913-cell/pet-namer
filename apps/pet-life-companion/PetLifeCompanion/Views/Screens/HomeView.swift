import SwiftUI
import TipKit

struct QuickLogTip: Tip {
    @Parameter
    static var hasLoggedEntry: Bool = false

    var title: Text {
        Text("まずは1件だけ")
    }

    var message: Text? {
        Text("食事、体調、散歩のどれかを選ぶと、通院前に見返しやすい形で残ります。")
    }

    var image: Image? {
        Image(systemName: "plus.circle.fill")
    }

    var rules: [Rule] {
        #Rule(Self.$hasLoggedEntry) { hasLoggedEntry in
            hasLoggedEntry == false
        }
    }
}

struct HomeView: View {
    @EnvironmentObject private var store: PetStore
    @State private var quickCategory: DiaryCategory = .food
    @State private var quickAmount = ""
    @State private var quickNote = ""
    @State private var quickSeverity = 2.0
    private let quickLogTip = QuickLogTip()

    private let careCopy = "短い記録を重ねるほど、食欲・体調・通院前メモが見返しやすくなります。"

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    PetSwitcherView()
                    todayHero
                    priorityCards
                    quickRecord
                    recentTimeline
                }
                .padding(.bottom, 24)
            }
            .background(AppTheme.canvas.ignoresSafeArea())
            .navigationTitle("今日")
        }
    }

    private var todayHero: some View {
        let pet = store.selectedPet
        return VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top, spacing: 16) {
                PetAvatarView(pet: pet, size: 88)
                VStack(alignment: .leading, spacing: 8) {
                    Text(pet.name)
                        .font(AppTheme.titleLarge())
                    Text("\(pet.species.rawValue) / \(pet.breed) / \(pet.ageText)")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(AppTheme.muted)
                    Text("\(pet.sex.rawValue) / \(pet.nextCare)")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(AppTheme.brandOrange)
                    Text(pet.personality)
                        .font(AppTheme.bodyText())
                        .foregroundStyle(AppTheme.muted)
                        .lineSpacing(4)
                }
            }

            Divider()

            Text(careCopy)
                .font(.caption)
                .foregroundStyle(AppTheme.muted)
                .lineSpacing(4)
            if !pet.lastNote.isEmpty {
                Text("前回メモ: \(pet.lastNote)")
                    .font(.footnote)
                    .foregroundStyle(AppTheme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .careCardStyle()
        .padding(.horizontal, AppTheme.screenPadding)
    }

    private var priorityCards: some View {
        VStack(alignment: .leading, spacing: 16) {
            SectionHeaderView(eyebrow: "今日", title: "次に見ること")

            ViewThatFits(in: .horizontal) {
                HStack(spacing: 8) {
                    MetricTile(title: "次の予定", value: store.selectedTasks.first?.title ?? "予定なし", detail: store.selectedTasks.first?.dueText ?? "今日は落ち着いています", icon: "checklist")
                    MetricTile(title: "体重", value: store.selectedPet.weightText, detail: store.latestWeightText, icon: "chart.line.uptrend.xyaxis")
                }

                VStack(spacing: 8) {
                    MetricTile(title: "次の予定", value: store.selectedTasks.first?.title ?? "予定なし", detail: store.selectedTasks.first?.dueText ?? "今日は落ち着いています", icon: "checklist")
                    MetricTile(title: "体重", value: store.selectedPet.weightText, detail: store.latestWeightText, icon: "chart.line.uptrend.xyaxis")
                }
            }

            Text(store.recentConcernText)
                .font(AppTheme.bodyText())
                .foregroundStyle(AppTheme.muted)
                .padding(16)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(AppTheme.surface)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        }
        .careCardStyle()
        .padding(.horizontal, AppTheme.screenPadding)
    }

    private var quickRecord: some View {
        VStack(alignment: .leading, spacing: 16) {
            SectionHeaderView(eyebrow: "すぐ記録", title: "30秒で残す")

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 96), spacing: 8)], spacing: 8) {
                ForEach([DiaryCategory.food, .medicine, .toilet, .symptom, .walk, .photo], id: \.self) { category in
                    Button {
                        quickCategory = category
                    } label: {
                        VStack(spacing: 8) {
                            Image(systemName: category.iconName)
                                .font(.headline)
                            Text(category.rawValue)
                                .font(.caption.weight(.bold))
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(minHeight: 56)
                        .padding(.vertical, 16)
                        .background(quickCategory == category ? AppTheme.brandOrange : AppTheme.surface)
                        .foregroundStyle(quickCategory == category ? AppTheme.brandDarkBrown : AppTheme.ink)
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .contentShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    }
                    .buttonStyle(.bordered)
                    .tint(quickCategory == category ? AppTheme.brandOrange : AppTheme.muted)
                    .selectedAccessibility(quickCategory == category)
                }
            }

            if quickCategory != .photo {
                HStack(spacing: 8) {
                    TextField(metricPlaceholder, text: $quickAmount)
                        .keyboardType(.decimalPad)
                        .textFieldStyle(.roundedBorder)
                    Text(metricUnit)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(AppTheme.muted)
                }
            }

            if quickCategory == .symptom {
                VStack(alignment: .leading, spacing: 8) {
                    Text("気になる強さ \(Int(quickSeverity))/5")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(AppTheme.muted)
                    Slider(value: $quickSeverity, in: 1...5, step: 1)
                        .tint(AppTheme.brandTerracotta)
                        .accessibilityLabel("気になる強さ")
                        .accessibilityValue("\(Int(quickSeverity)) / 5")
                }
            }

            TextField("メモを一言。例: 夜に2回だけ咳。水は飲めている。", text: $quickNote, axis: .vertical)
                .lineLimit(2...4)
                .padding(16)
                .background(AppTheme.surface)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))

            Button {
                store.addQuickEntry(
                    category: quickCategory,
                    title: quickTitle,
                    note: quickNote,
                    amount: Double(quickAmount),
                    unit: quickAmount.isEmpty ? nil : metricUnit,
                    severity: quickCategory == .symptom ? Int(quickSeverity) : nil
                )
                quickAmount = ""
                quickNote = ""
                quickSeverity = 2
                QuickLogTip.hasLoggedEntry = true
            } label: {
                Label("記録を追加", systemImage: "plus.circle.fill")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
            }
            .buttonStyle(.borderedProminent)
            .tint(AppTheme.brandOrange)
            .accessibilityIdentifier("quickRecordAddButton")
            .sensoryFeedback(.success, trigger: store.entries.count)
            .popoverTip(quickLogTip, arrowEdge: .bottom)
        }
        .careCardStyle()
        .padding(.horizontal, AppTheme.screenPadding)
    }

    private var recentTimeline: some View {
        VStack(alignment: .leading, spacing: 8) {
            SectionHeaderView(eyebrow: "記録", title: "最近の記録")
            if store.selectedEntries.isEmpty {
                EmptyStateView(
                    icon: "square.and.pencil",
                    title: "今日の小さな変化から残せます",
                    message: "食事、散歩、体調のどれか1つを選ぶだけで十分です。"
                )
            } else {
                ForEach(store.selectedEntries.prefix(3)) { entry in
                    DiaryEntryRow(entry: entry)
                    if entry.id != store.selectedEntries.prefix(3).last?.id {
                        Divider()
                    }
                }
            }
        }
        .careCardStyle()
        .padding(.horizontal, AppTheme.screenPadding)
    }

    private var metricUnit: String {
        switch quickCategory {
        case .food: "g"
        case .medicine, .symptom: "回"
        case .walk: "分"
        case .toilet: "回"
        case .photo, .vet, .note: ""
        }
    }

    private var metricPlaceholder: String {
        switch quickCategory {
        case .food: "量"
        case .medicine: "回数"
        case .symptom: "回数"
        case .walk: "時間"
        case .toilet: "回数"
        case .photo, .vet, .note: ""
        }
    }

    private var quickTitle: String {
        switch quickCategory {
        case .food: "ごはんの記録"
        case .medicine: "くすりの記録"
        case .toilet: "トイレの記録"
        case .symptom: "体調メモ"
        case .walk: "散歩の記録"
        case .photo: "写真日記"
        case .vet: "病院メモ"
        case .note: "メモ"
        }
    }
}

struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title)
                .foregroundStyle(AppTheme.brandOrange)
                .frame(width: 56, height: 56)
                .background(.ultraThinMaterial)
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            Text(title)
                .font(.headline)
                .foregroundStyle(AppTheme.ink)
                .multilineTextAlignment(.center)
            Text(message)
                .font(AppTheme.bodyText())
                .foregroundStyle(AppTheme.muted)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 24)
        .accessibilityElement(children: .combine)
    }
}

private struct MetricTile: View {
    let title: String
    let value: String
    let detail: String
    let icon: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: icon)
                .font(.headline)
                .foregroundStyle(AppTheme.brandOrange)
            Text(title)
                .font(.caption.weight(.semibold))
                .foregroundStyle(AppTheme.muted)
            Text(value)
                .font(.headline)
                .foregroundStyle(AppTheme.ink)
                .fixedSize(horizontal: false, vertical: true)
            Text(detail)
                .font(.caption)
                .foregroundStyle(AppTheme.muted)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(AppTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}
