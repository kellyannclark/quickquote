import { Link } from 'expo-router';
import { type ComponentProps } from 'react';
import { Platform, Linking } from 'react-native';

type Props = ComponentProps<typeof Link> & { href: string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event) => {
        if (Platform.OS !== 'web') {
          // Prevent the default behavior of opening in the browser on native.
          event.preventDefault();
          // Open the link using React Native's Linking API.
          await Linking.openURL(href);
        }
      }}
    />
  );
}
