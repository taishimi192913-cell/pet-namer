import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../styles';
import { useThemeMode } from '../theme';

export function Section({
  title,
  body,
  children,
}: {
  title: string;
  body?: string;
  children: React.ReactNode;
}) {
  const theme = useThemeMode();

  return (
    <View style={theme.apply(styles.section, 'section')}>
      <Text style={theme.apply(styles.sectionTitle, 'sectionTitle')}>{title}</Text>
      {body ? <Text style={theme.apply(styles.sectionBody, 'sectionBody')}>{body}</Text> : null}
      {children}
    </View>
  );
}
