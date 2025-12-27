import { Stack } from 'expo-router';

export default function CuisineLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[slug]" />
    </Stack>
  );
}
