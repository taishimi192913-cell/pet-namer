import SwiftUI

struct ShareView: View {
    @EnvironmentObject private var store: PetStore
    @State private var selectedDays = 7

    private let dayOptions = [7, 30]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    PetSwitcherView()
                    memoCard
                    handoffCard
                    sippomiBanner
                }
                .padding(.bottom, 24)
            }
            .background(AppTheme.canvas.ignoresSafeArea())
            .navigationTitle("共有")
        }
    }

    private var memoCard: some View {
        let memo = store.vetMemo(days: selectedDays)
        return VStack(alignment: .leading, spacing: 16) {
            SectionHeaderView(
                eyebrow: "通院メモ",
                title: "獣医さんに見せるメモ",
                detail: "症状、食事、薬、体重、未完了の予定を、診察前にそのまま共有できる形でまとめます。"
            )

            Picker("期間", selection: $selectedDays) {
                ForEach(dayOptions, id: \.self) { days in
                    Text("\(days)日").tag(days)
                }
            }
            .pickerStyle(.segmented)

            Text(memo)
                .font(.callout)
                .foregroundStyle(AppTheme.ink)
                .lineSpacing(4)
                .padding(16)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(AppTheme.surface)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))

            ShareLink(item: memo) {
                Label("メモを共有", systemImage: "square.and.arrow.up")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
            }
            .buttonStyle(.borderedProminent)
            .tint(AppTheme.brandOrange)
        }
        .careCardStyle()
        .padding(.horizontal, AppTheme.screenPadding)
    }

    private var handoffCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            SectionHeaderView(eyebrow: "家族", title: "\(store.selectedPet.name)のお世話引き継ぎ")
            handoffRow("ごはん", store.selectedEntries.first { $0.category == .food }?.metricText ?? "量を記録してください")
            handoffRow("薬", store.selectedPet.medications.first ?? "登録なし")
            handoffRow("病院", "\(store.selectedPet.vetName) \(store.selectedPet.vetPhone)")
            handoffRow("識別", store.selectedPet.microchipId.isEmpty ? "マイクロチップ未登録" : store.selectedPet.microchipId)
            handoffRow("注意", store.selectedPet.notes)
        }
        .careCardStyle()
        .padding(.horizontal, AppTheme.screenPadding)
    }

    private var sippomiBanner: some View {
        Button {
            if let url = URL(string: "https://sippomi.com") {
                UIApplication.shared.open(url)
            }
        } label: {
            HStack {
                Image(systemName: "pawprint.fill")
                    .font(.title3)
                VStack(alignment: .leading, spacing: 4) {
                    Text("Sippomi ペットの名前診断")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(AppTheme.ink)
                    Text("AIがあなたにぴったりの名前を提案します")
                        .font(.caption)
                        .foregroundStyle(AppTheme.muted)
                }
                Spacer()
                Image(systemName: "arrow.up.forward.app")
                    .font(.headline)
                    .foregroundStyle(AppTheme.brandCta)
            }
            .padding(16)
            .background(AppTheme.surface)
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadius, style: .continuous))
            .shadow(color: AppTheme.brandDarkBrown.opacity(0.06), radius: 8, x: 0, y: 4)
        }
        .buttonStyle(.plain)
        .padding(.horizontal, AppTheme.screenPadding)
    }

    private func handoffRow(_ label: String, _ value: String) -> some View {
        ViewThatFits(in: .horizontal) {
            HStack(alignment: .top, spacing: 16) {
                handoffLabel(label)
                handoffValue(value)
                Spacer(minLength: 0)
            }

            VStack(alignment: .leading, spacing: 8) {
                handoffLabel(label)
                handoffValue(value)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func handoffLabel(_ label: String) -> some View {
        Text(label)
            .font(.caption.weight(.bold))
            .foregroundStyle(AppTheme.brandOrange)
            .lineLimit(2)
            .multilineTextAlignment(.center)
            .padding(.horizontal, 8)
            .padding(.vertical, 8)
            .frame(minWidth: 56, minHeight: 30)
            .background(AppTheme.softSurface)
            .clipShape(Capsule())
    }

    private func handoffValue(_ value: String) -> some View {
        Text(value)
            .font(AppTheme.bodyText())
            .foregroundStyle(AppTheme.muted)
            .fixedSize(horizontal: false, vertical: true)
    }
}
