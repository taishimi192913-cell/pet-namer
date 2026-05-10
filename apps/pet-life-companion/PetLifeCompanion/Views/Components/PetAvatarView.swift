import SwiftUI

struct PetAvatarView: View {
    let pet: Pet
    var size: CGFloat = 72

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: size * 0.24, style: .continuous)
                .fill(pet.tint)

            Image(systemName: pet.symbolName)
                .font(.system(size: size * 0.42, weight: .semibold))
                .foregroundStyle(AppTheme.brandDarkBrown)
        }
        .frame(width: size, height: size)
        .accessibilityLabel("\(pet.name)の写真")
    }
}
