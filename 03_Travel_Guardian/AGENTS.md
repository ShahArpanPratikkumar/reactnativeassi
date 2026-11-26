# Travel Guardian — Agent & Developer Reference

Expo SDK: 58.0.0 (https://docs.expo.dev/versions/v58.0.0/)
React Native: 0.88.1 | React: 19.3.0
Architecture: React Native + Expo Router + Express / MongoDB REST backend

## Key Conventions
- **Routing**: Use Expo Router file-based routing inside `app/`. Do not place non-route components in `app/`.
- **Components**: Group reusable components in `components/common/`, `components/camera/`, `components/contacts/`.
- **Constants**: Single source of truth for vehicles is `constants/vehicles.js`. Global API config is in `constants/config.js`.
- **State & Architecture**: Beginner-friendly structure. Do NOT introduce Redux, Zustand, or complex design patterns.
- **Theme**: Light & Dark mode managed via `context/ThemeContext.js`.
