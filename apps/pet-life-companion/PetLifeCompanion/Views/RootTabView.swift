import SwiftUI

enum AppTab: String, CaseIterable {
    case home
    case diary
    case health
    case talk
    case share

    var title: String {
        switch self {
        case .home: "ホーム"
        case .diary: "日記"
        case .health: "健康"
        case .talk: "相談"
        case .share: "共有"
        }
    }

    var icon: String {
        switch self {
        case .home: "house.fill"
        case .diary: "book.pages.fill"
        case .health: "heart.text.square.fill"
        case .talk: "bubble.left.and.text.bubble.right.fill"
        case .share: "person.2.fill"
        }
    }
}

struct RootTabView: View {
    @EnvironmentObject private var store: PetStore
    @EnvironmentObject private var network: NetworkStatusMonitor

    var body: some View {
        Group {
            if store.persistenceState == .preparing {
                SkeletonHomeView()
            } else {
                TabView {
                    HomeView()
                        .tabItem { Label(AppTab.home.title, systemImage: AppTab.home.icon) }

                    DiaryView()
                        .tabItem { Label(AppTab.diary.title, systemImage: AppTab.diary.icon) }

                    HealthView()
                        .tabItem { Label(AppTab.health.title, systemImage: AppTab.health.icon) }

                    TalkView()
                        .tabItem { Label(AppTab.talk.title, systemImage: AppTab.talk.icon) }

                    ShareView()
                        .tabItem { Label(AppTab.share.title, systemImage: AppTab.share.icon) }
                }
            }
        }
        .tint(AppTheme.brandOrange)
        .safeAreaInset(edge: .top) {
            StatusBanner(message: statusMessage)
        }
    }

    private var statusMessage: String? {
        if !network.isOnline {
            return "オフラインです。記録は端末に保存し、接続後もそのまま使えます。"
        }
        return store.persistenceState.userMessage
    }
}

private struct StatusBanner: View {
    let message: String?

    var body: some View {
        if let message {
            Label(message, systemImage: "wifi.slash")
                .font(.footnote.weight(.semibold))
                .foregroundStyle(AppTheme.ink)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(.ultraThinMaterial)
                .overlay(alignment: .bottom) {
                    Rectangle()
                        .fill(AppTheme.line)
                        .frame(height: 1)
                }
                .transition(.move(edge: .top).combined(with: .opacity))
                .accessibilityAddTraits(.isStaticText)
        }
    }
}

private struct SkeletonHomeView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                ForEach(0..<4, id: \.self) { index in
                    VStack(alignment: .leading, spacing: 16) {
                        skeletonLine(width: index == 0 ? 190 : 130, height: 18)
                        skeletonLine(width: nil, height: index == 0 ? 96 : 64)
                        skeletonLine(width: 220, height: 14)
                    }
                    .careCardStyle()
                }
            }
            .padding(.horizontal, AppTheme.screenPadding)
            .padding(.vertical, 24)
        }
        .background(AppTheme.canvas.ignoresSafeArea())
        .overlay {
            ShimmerOverlay()
                .allowsHitTesting(false)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("記録を読み込んでいます")
    }

    private func skeletonLine(width: CGFloat?, height: CGFloat) -> some View {
        RoundedRectangle(cornerRadius: height * 0.3, style: .continuous)
            .fill(AppTheme.softSurface)
            .frame(width: width, height: height)
            .frame(maxWidth: width == nil ? .infinity : nil, alignment: .leading)
    }
}

private struct ShimmerOverlay: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var offset: CGFloat = -220

    var body: some View {
        if reduceMotion {
            Color.clear
        } else {
            GeometryReader { proxy in
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [.clear, Color(.systemBackground).opacity(0.28), .clear],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .rotationEffect(.degrees(16))
                    .offset(x: offset)
                    .onAppear {
                        offset = proxy.size.width + 220
                    }
                    .animation(AppTheme.spring.repeatForever(autoreverses: false), value: offset)
            }
            .blendMode(.plusLighter)
        }
    }
}
