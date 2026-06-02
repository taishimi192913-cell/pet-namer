import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '../designTokens';

export function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: tokens.colors.petalWhite }}>
      {/* Debug: colored bands to verify flex layout */}
      <View style={{ flex: 1, padding: 32, backgroundColor: '#E8F0E8' }}>
        <View style={{ flex: 2, backgroundColor: '#D0E0F0' }} />
        <View style={{
          alignItems: 'center', backgroundColor: '#FFE0E0', padding: 20,
        }}>
          <Text style={{
            fontSize: 28, fontWeight: '800', color: '#4A353A', textAlign: 'center',
          }}>しっぽみ</Text>
          <Text style={{
            fontSize: 30, lineHeight: 40, color: '#5C444A', fontWeight: '700',
            textAlign: 'center', marginBottom: 16,
          }}>その子に、ぴったりの名前を。</Text>
        </View>
        <View style={{ flex: 3, backgroundColor: '#E0E8F0' }} />
        <View style={{
          alignItems: 'center', backgroundColor: '#E0FFE0', padding: 20,
        }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#5B9BD5', paddingVertical: 18, paddingHorizontal: 40,
            borderRadius: 999, minWidth: 260,
          }}>
            <Text style={{ color: '#FDF8F4', fontSize: 17, fontWeight: '700' }}>
              診断をはじめる
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FDF8F4" style={{ marginLeft: 6 }} />
          </View>
        </View>
      </View>
    </View>
  );
}
