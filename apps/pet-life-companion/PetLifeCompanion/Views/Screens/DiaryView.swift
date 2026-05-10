import SwiftUI

struct DiaryView: View {
    @EnvironmentObject private var store: PetStore
    @State private var selectedCategory: DiaryCategory?
    @State private var query = ""

    private var filteredEntries: [DiaryEntry] {
        store.selectedEntries.filter { entry in
            let categoryMatches = selectedCategory == nil || entry.category == selectedCategory
            let queryMatches = query.isEmpty
                || entry.title.localizedCaseInsensitiveContains(query)
                || entry.body.localizedCaseInsensitiveContains(query)
            return categoryMatches && queryMatches
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    PetSwitcherView()
                    filters
                    timeline
                }
                .padding(.bottom, 24)
            }
            .background(AppTheme.canvas.ignoresSafeArea())
            .navigationTitle("日記")
            .searchable(text: $query, prompt: "記録を検索")
        }
    }

    private var filters: some View {
        VStack(alignment: .leading, spacing: 16) {
            SectionHeaderView(
                eyebrow: "日記",
                title: "見返しやすい記録",
                detail: "写真、食欲、体調、薬を同じ時間軸で残します。必要な時だけ絞り込めます。"
            )

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    filterChip("すべて", icon: "line.3.horizontal.decrease.circle", isSelected: selectedCategory == nil) {
                        selectedCategory = nil
                    }
                    ForEach(DiaryCategory.allCases) { category in
                        filterChip(category.rawValue, icon: category.iconName, isSelected: selectedCategory == category) {
                            selectedCategory = category
                        }
                    }
                }
            }
        }
        .careCardStyle()
        .padding(.horizontal, AppTheme.screenPadding)
    }

    private var timeline: some View {
        VStack(spacing: 0) {
            if filteredEntries.isEmpty {
                EmptyStateView(
                    icon: "square.and.pencil",
                    title: "まだ記録がありません",
                    message: "今日のごはん、体調、写真のどれか1つから残せます。"
                )
            } else {
                ForEach(filteredEntries) { entry in
                    DiaryEntryRow(entry: entry)
                    if entry.id != filteredEntries.last?.id {
                        Divider()
                    }
                }
            }
        }
        .careCardStyle()
        .padding(.horizontal, AppTheme.screenPadding)
    }

    private func filterChip(_ title: String, icon: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Label(title, systemImage: icon)
                .font(.caption.weight(.bold))
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .frame(minHeight: 44)
                .background(isSelected ? AppTheme.brandOrange : AppTheme.surface)
                .foregroundStyle(isSelected ? AppTheme.brandDarkBrown : AppTheme.ink)
                .clipShape(Capsule())
                .overlay {
                    Capsule().stroke(AppTheme.line, lineWidth: 1)
                }
                .contentShape(Capsule())
        }
        .buttonStyle(.bordered)
        .tint(isSelected ? AppTheme.brandOrange : AppTheme.muted)
        .selectedAccessibility(isSelected)
    }
}
