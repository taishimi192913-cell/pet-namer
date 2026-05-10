import SwiftUI
import Charts

struct HealthView: View {
    @EnvironmentObject private var store: PetStore
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    @State private var newWeight = ""

    private var symptomCount: Int {
        store.selectedEntries
            .filter { $0.category == .symptom }
            .reduce(0) { $0 + Int($1.amount ?? 1) }
    }

    private var medicineCount: Int {
        store.selectedEntries.filter { $0.category == .medicine }.count
    }

    private var weightAccessibilitySummary: String {
        let weights = store.selectedWeights
        guard let first = weights.first, let latest = weights.last else {
            return "体重の記録はまだありません"
        }
        let minimum = weights.min { $0.value < $1.value } ?? latest
        let maximum = weights.max { $0.value < $1.value } ?? latest
        return "期間 \(first.label) から \(latest.label)。最新 \(String(format: "%.1f", latest.value)) キログラム。最小 \(String(format: "%.1f", minimum.value)) キログラム、最大 \(String(format: "%.1f", maximum.value)) キログラム。"
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    PetSwitcherView()
                    healthSummary
                    weightCard
                    reminderCard
                    medicationCard
                }
                .padding(.bottom, 24)
            }
            .background(AppTheme.canvas.ignoresSafeArea())
            .navigationTitle("健康")
        }
    }

    private var healthSummary: some View {
        VStack(alignment: .leading, spacing: 16) {
            SectionHeaderView(eyebrow: "健康", title: "\(store.selectedPet.name)の健康サマリー")
            ViewThatFits(in: .horizontal) {
                HStack(spacing: 8) {
                    HealthTile(title: "体重", value: store.selectedPet.weightText, icon: "scalemass.fill")
                    HealthTile(title: "症状", value: "\(symptomCount)回", icon: "cross.case.fill")
                    HealthTile(title: "薬", value: "\(medicineCount)件", icon: "pills.fill")
                }

                LazyVGrid(columns: [GridItem(.adaptive(minimum: dynamicTypeSize.isAccessibilitySize ? 180 : 120), spacing: 8)], spacing: 8) {
                    HealthTile(title: "体重", value: store.selectedPet.weightText, icon: "scalemass.fill")
                    HealthTile(title: "症状", value: "\(symptomCount)回", icon: "cross.case.fill")
                    HealthTile(title: "薬", value: "\(medicineCount)件", icon: "pills.fill")
                }
            }
            Text(store.recentConcernText)
                .font(AppTheme.bodyText())
                .foregroundStyle(AppTheme.muted)
                .lineSpacing(4)
        }
        .careCardStyle()
        .padding(.horizontal, AppTheme.screenPadding)
    }

    private var weightCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            SectionHeaderView(eyebrow: "体重", title: "体重の推移")

            if store.selectedWeights.isEmpty {
                EmptyStateView(
                    icon: "scalemass.fill",
                    title: "体重はまだ記録されていません",
                    message: "最初の1回を入れると、次から変化を線で確認できます。"
                )
            } else {
                Chart(store.selectedWeights) { point in
                    LineMark(
                        x: .value("日付", point.date),
                        y: .value("体重", point.value)
                    )
                    .foregroundStyle(AppTheme.brandOrange)

                    PointMark(
                        x: .value("日付", point.date),
                        y: .value("体重", point.value)
                    )
                    .foregroundStyle(AppTheme.brandOrange)
                }
                .frame(height: 180)
                .accessibilityLabel("\(store.selectedPet.name)の体重推移")
                .accessibilityValue(weightAccessibilitySummary)
            }

            ViewThatFits(in: .horizontal) {
                HStack(spacing: 8) {
                    weightField
                    addWeightButton
                }

                VStack(alignment: .leading, spacing: 8) {
                    weightField
                    addWeightButton
                }
            }
        }
        .careCardStyle()
        .padding(.horizontal, AppTheme.screenPadding)
    }

    private var weightField: some View {
        HStack(spacing: 8) {
            TextField("体重", text: $newWeight)
                .keyboardType(.decimalPad)
                .textFieldStyle(.roundedBorder)
            Text("kg")
                .foregroundStyle(AppTheme.muted)
        }
    }

    private var addWeightButton: some View {
        Button {
            if let value = Double(newWeight) {
                store.addWeight(value)
                newWeight = ""
            }
        } label: {
            Label("追加", systemImage: "plus")
                .frame(maxWidth: .infinity)
                .frame(minHeight: 44)
        }
        .buttonStyle(.borderedProminent)
        .tint(AppTheme.brandOrange)
        .sensoryFeedback(.success, trigger: store.weights.count)
    }

    private var reminderCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            SectionHeaderView(
                eyebrow: "予定",
                title: "次のケア",
                detail: "完了した日を実施日として残し、繰り返し予定は次回分を自動で作ります。"
            )
            if store.selectedTasks.isEmpty {
                EmptyStateView(
                    icon: "checkmark.circle.fill",
                    title: "未完了の予定はありません",
                    message: "薬、通院、体重測定を追加するとここで確認できます。"
                )
            } else {
                ForEach(store.selectedTasks) { task in
                    CareTaskRow(task: task) {
                        store.completeTask(task)
                    }
                    if task.id != store.selectedTasks.last?.id {
                        Divider()
                    }
                }
            }
        }
        .careCardStyle()
        .padding(.horizontal, AppTheme.screenPadding)
    }

    private var medicationCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            SectionHeaderView(eyebrow: "薬", title: "薬・注意点")
            ForEach(store.selectedPet.medications, id: \.self) { medication in
                Label(medication, systemImage: "pills.fill")
                    .font(AppTheme.bodyText())
                    .foregroundStyle(AppTheme.ink)
            }
            if store.selectedPet.medications.isEmpty {
                Text("登録された薬はありません。")
                    .font(AppTheme.bodyText())
                    .foregroundStyle(AppTheme.muted)
            }
            Divider()
            Label(store.selectedPet.allergies, systemImage: "exclamationmark.triangle.fill")
                .font(AppTheme.bodyText())
                .foregroundStyle(AppTheme.muted)
        }
        .careCardStyle()
        .padding(.horizontal, AppTheme.screenPadding)
    }
}

private struct HealthTile: View {
    let title: String
    let value: String
    let icon: String

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .foregroundStyle(AppTheme.brandOrange)
            Text(value)
                .font(.headline)
            Text(title)
                .font(.caption)
                .foregroundStyle(AppTheme.muted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(AppTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}
