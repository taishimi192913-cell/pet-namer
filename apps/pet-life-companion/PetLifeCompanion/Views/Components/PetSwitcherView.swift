import SwiftUI

struct PetSwitcherView: View {
    @EnvironmentObject private var store: PetStore
    @Namespace private var selectionNamespace

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(store.pets) { pet in
                    Button {
                        store.selectPet(pet)
                    } label: {
                        HStack(spacing: 8) {
                            PetAvatarView(pet: pet, size: 34)
                            Text(pet.name)
                                .font(.headline)
                        }
                        .padding(.vertical, 8)
                        .padding(.leading, 8)
                        .padding(.trailing, 16)
                        .frame(minHeight: 44)
                        .background {
                            if store.selectedPetId == pet.id {
                                Capsule()
                                    .fill(AppTheme.brandOrange)
                                    .matchedGeometryEffect(id: "selectedPet", in: selectionNamespace)
                            } else {
                                Capsule()
                                    .fill(AppTheme.surface)
                            }
                        }
                        .foregroundStyle(store.selectedPetId == pet.id ? AppTheme.brandDarkBrown : AppTheme.ink)
                        .overlay {
                            Capsule().stroke(AppTheme.line, lineWidth: 1)
                        }
                        .contentShape(Capsule())
                    }
                    .buttonStyle(.bordered)
                    .tint(store.selectedPetId == pet.id ? AppTheme.brandOrange : AppTheme.muted)
                    .selectedAccessibility(store.selectedPetId == pet.id)
                    .accessibilityHint("表示するペットを切り替えます")
                }
            }
            .padding(.horizontal, AppTheme.screenPadding)
            .padding(.vertical, 4)
        }
        .sensoryFeedback(.selection, trigger: store.selectedPetId)
    }
}
