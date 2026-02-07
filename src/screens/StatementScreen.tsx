import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { COLORS } from '../constants';
import { useStatementStore } from '../store/statementStore';
import { generateStatementText } from '../utils/generateCopyText';
import { formatCurrency } from '../utils/formatCurrency';
import SectionCard from '../components/SectionCard';
import { formatCount } from '../utils/timeCalculation';
import AmountInput from '../components/AmountInput';
import LiquorItemComponent from '../components/LiquorItem';
import LiquorPresetSelector from '../components/LiquorPresetSelector';
import HostessItem from '../components/HostessItem';
import PurchaseItemComponent from '../components/PurchaseItem';
import SummaryBar from '../components/SummaryBar';
import { SessionPart } from '../types';

export default function StatementScreen() {
  const store = useStatementStore();
  const [hostessCollapsed, setHostessCollapsed] = useState<Record<string, boolean>>(
    Object.fromEntries(store.hostesses.map((h, i) => [h.id, i > 0]))
  );
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editingSlotLabel, setEditingSlotLabel] = useState('');

  const handleCopy = useCallback(async () => {
    if (!store.roomNumber.trim()) {
      Alert.alert('알림', '방번호를 입력해주세요.');
      return;
    }
    const text = generateStatementText(store.getStatementData());
    await Clipboard.setStringAsync(text);
    if (Platform.OS === 'android') {
      ToastAndroid.show('클립보드에 복사되었습니다!', ToastAndroid.SHORT);
    } else {
      Alert.alert('복사 완료', '카톡에 붙여넣기 하세요!');
    }
  }, [store]);

  const handleReset = useCallback(() => {
    Alert.alert('초기화', '현재 내역서를 초기화하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '초기화', style: 'destructive', onPress: () => store.resetAll() },
    ]);
  }, [store]);

  const toggleHostess = useCallback((id: string) => {
    setHostessCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const liquorTotal = store.getLiquorTotal();
  const totalBottles = store.getTotalLiquorBottles();
  const partyNum = parseInt(store.partySize, 10) || 0;
  const hostessTotal = store.getHostessTotal();
  const purchaseTotal = store.getPurchaseTotal();
  const grandTotal = store.getGrandTotal();

  // TC 참고
  const tcTotalCount = store.hostesses.reduce((sum, h) => sum + h.count, 0);
  const wholeTcTotal = store.hostesses.reduce((sum, h) => sum + Math.floor(h.count), 0);
  const isSpecialRoom = store.roomType !== 'normal';
  const effectiveBottles = isSpecialRoom ? 1 : totalBottles;
  const basicTcCount = effectiveBottles * partyNum;
  const extensionWhole = Math.max(0, wholeTcTotal - basicTcCount);
  const total02 = store.hostesses.filter(h => {
    const frac = Math.round((h.count % 1) * 10);
    return frac === 2;
  }).length;
  const total05 = store.hostesses.filter(h => {
    const frac = Math.round((h.count % 1) * 10);
    return frac === 5;
  }).length;

  const activeSlotIndex = store.slots.findIndex(s => s.id === store.activeSlotId);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* 내역서 슬롯 선택 바 */}
      <View style={styles.slotBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.slotScroll}
          keyboardShouldPersistTaps="always"
        >
          {store.slots.map((slot) => {
            const isActive = slot.id === store.activeSlotId;
            const isEditing = editingSlotId === slot.id;
            return (
              <View key={slot.id} style={[styles.slotTab, isActive && styles.slotTabActive]}>
                {isEditing ? (
                  <TextInput
                    style={styles.slotNameInput}
                    value={editingSlotLabel}
                    onChangeText={setEditingSlotLabel}
                    onBlur={() => {
                      if (editingSlotLabel.trim()) {
                        store.renameSlot(slot.id, editingSlotLabel.trim());
                      }
                      setEditingSlotId(null);
                    }}
                    onSubmitEditing={() => {
                      if (editingSlotLabel.trim()) {
                        store.renameSlot(slot.id, editingSlotLabel.trim());
                      }
                      setEditingSlotId(null);
                    }}
                    autoFocus
                    selectTextOnFocus
                    returnKeyType="done"
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      if (isActive) {
                        setEditingSlotId(slot.id);
                        setEditingSlotLabel(slot.label);
                      } else {
                        store.switchSlot(slot.id);
                      }
                    }}
                    activeOpacity={0.7}
                    style={styles.slotTabTouchArea}
                  >
                    <Text style={[styles.slotTabText, isActive && styles.slotTabTextActive]}>
                      {slot.label}
                    </Text>
                    {isActive && (
                      <Text style={styles.slotHint}>눌러서 이름변경</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
          {store.slots.length < 10 && (
            <TouchableOpacity style={styles.slotAddBtn} onPress={store.createSlot}>
              <Text style={styles.slotAddText}>+</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
      {store.slots.length > 1 && (
        <Pressable
          style={({ pressed }) => [styles.slotDeleteBar, pressed && styles.slotDeleteBarPressed]}
          onPress={() => store.deleteSlot(store.activeSlotId)}
        >
          <Text style={styles.slotDeleteBarText}>현재 내역서 삭제</Text>
        </Pressable>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 기본 정보 */}
        <SectionCard title="기본 정보">
          {/* 1부/2부 토글 */}
          <View style={styles.sessionPartRow}>
            {(['1부', '2부'] as SessionPart[]).map((part) => {
              const active = store.sessionPart === part;
              return (
                <TouchableOpacity
                  key={part}
                  style={[styles.sessionPartBtn, active && styles.sessionPartBtnActive]}
                  onPress={() => store.setSessionPart(part)}
                >
                  <Text style={[styles.sessionPartText, active && styles.sessionPartTextActive]}>
                    {part}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.infoRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>방번호 *</Text>
              <TextInput
                style={styles.textInput}
                value={store.roomNumber}
                onChangeText={store.setRoomNumber}
                placeholder="12"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                returnKeyType="done"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>인원수</Text>
              <TextInput
                style={styles.textInput}
                value={store.partySize}
                onChangeText={store.setPartySize}
                placeholder="0"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                returnKeyType="done"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>담당 *</Text>
              <TextInput
                style={styles.textInput}
                value={store.managerName}
                onChangeText={store.setManagerName}
                placeholder="담당이름"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>WT *</Text>
              <TextInput
                style={styles.textInput}
                value={store.waiterName}
                onChangeText={store.setWaiterName}
                placeholder="본인이름"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>
        </SectionCard>

        {/* 주류(주대) */}
        <SectionCard
          title={`주류 (주대) ${liquorTotal > 0 ? formatCurrency(liquorTotal) : ''}`}
        >
          <LiquorPresetSelector
            onSelect={(name, price) => store.addLiquor(name, price)}
            onCustom={() => store.addLiquor()}
          />
          {store.liquors.map((liquor) => (
            <LiquorItemComponent
              key={liquor.id}
              item={liquor}
              onUpdate={(field) => store.updateLiquor(liquor.id, field)}
              onRemove={() => store.removeLiquor(liquor.id)}
            />
          ))}
          {store.liquors.length === 0 && (
            <Text style={styles.emptyText}>위 버튼으로 주류를 추가하세요</Text>
          )}
        </SectionCard>

        {/* T/C 총금액 (아가씨 금액 합산) */}
        <SectionCard title={`T/C ${hostessTotal > 0 ? formatCurrency(hostessTotal) : ''}`}>
          <View style={styles.tcAutoBox}>
            <Text style={styles.tcAutoLabel}>T/C 총금액 (아가씨 금액 합산)</Text>
            <Text style={styles.tcAutoValue}>
              {hostessTotal > 0 ? formatCurrency(hostessTotal) : '₩0'}
            </Text>
          </View>
        </SectionCard>

        {/* 아가씨 */}
        <SectionCard
          title="아가씨"
          rightAction={
            <TouchableOpacity style={styles.addBtn} onPress={store.addHostess}>
              <Text style={styles.addBtnText}>+ 추가</Text>
            </TouchableOpacity>
          }
        >
          {store.hostesses.map((hostess) => (
            <HostessItem
              key={hostess.id}
              item={hostess}
              onUpdate={(field) => store.updateHostess(hostess.id, field)}
              onRemove={() => store.removeHostess(hostess.id)}
              collapsed={hostessCollapsed[hostess.id] ?? true}
              onToggle={() => toggleHostess(hostess.id)}
            />
          ))}
          {store.hostesses.length === 0 && (
            <Text style={styles.emptyText}>+ 추가 버튼으로 아가씨를 추가하세요</Text>
          )}
          {store.hostesses.length > 0 && (
            <View style={styles.tcRefBox}>
              <Text style={styles.tcRefTitle}>T/C 참고</Text>
              <View style={styles.roomTypeRow}>
                {(['normal', '2bottle', 'big3bottle', 'mid2bottle'] as const).map((type) => {
                  const labels: Record<string, string> = {
                    normal: '일반',
                    '2bottle': '2병스타트',
                    big3bottle: '대방 3병',
                    mid2bottle: '중방 2병',
                  };
                  const active = store.roomType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.roomTypeBtn, active && styles.roomTypeBtnActive]}
                      onPress={() => store.setRoomType(type)}
                    >
                      <Text style={[styles.roomTypeBtnText, active && styles.roomTypeBtnTextActive]}>
                        {labels[type]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {isSpecialRoom && (
                <Text style={styles.tcRefSub}>* {store.roomType === 'big3bottle' ? '3병' : '2병'} 스타트 → 1병으로 계산</Text>
              )}
              <Text style={styles.tcRefText}>
                TC 총개수: <Text style={styles.tcRefVal}>{formatCount(tcTotalCount)}개</Text>
              </Text>
              <Text style={styles.tcRefText}>
                기본티시: <Text style={styles.tcRefVal}>{basicTcCount}개</Text>
              </Text>
              <Text style={styles.tcRefText}>
                연장티시: <Text style={styles.tcRefHighlight}>{extensionWhole}개</Text>  ({wholeTcTotal} - {basicTcCount}) (주류 {effectiveBottles}병 x {partyNum}명)
              </Text>
              <Text style={styles.tcRefSub}>* 0.2개, 0.5개는 연장 개수에 포함하지 않음</Text>
              {(total02 > 0 || total05 > 0) && (
                <View style={styles.tcFracRow}>
                  {total02 > 0 && (
                    <Text style={styles.tcFracText}>
                      0.2개 (<Text style={styles.tcRefVal}>{total02}개</Text>)
                    </Text>
                  )}
                  {total05 > 0 && (
                    <Text style={styles.tcFracText}>
                      0.5개 (<Text style={styles.tcRefVal}>{total05}개</Text>)
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        </SectionCard>

        {/* W/T */}
        <SectionCard title="W/T">
          <AmountInput
            value={store.wtAmount}
            onChangeValue={store.setWtAmount}
            label="W/T 금액"
          />
        </SectionCard>

        {/* 사입 */}
        <SectionCard
          title={`사입 ${purchaseTotal > 0 ? formatCurrency(purchaseTotal) : ''}`}
          rightAction={
            <TouchableOpacity style={styles.addBtn} onPress={store.addPurchase}>
              <Text style={styles.addBtnText}>+ 추가</Text>
            </TouchableOpacity>
          }
        >
          {store.purchases.map((purchase) => (
            <PurchaseItemComponent
              key={purchase.id}
              item={purchase}
              onUpdate={(field) => store.updatePurchase(purchase.id, field)}
              onRemove={() => store.removePurchase(purchase.id)}
            />
          ))}
          {store.purchases.length === 0 && (
            <Text style={styles.emptyText}>+ 추가 버튼으로 사입을 추가하세요</Text>
          )}
        </SectionCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <SummaryBar
        items={[
          { label: '주대', amount: liquorTotal },
          { label: 'TC', amount: hostessTotal },
          { label: 'WT', amount: store.wtAmount },
          { label: '사입', amount: purchaseTotal },
        ]}
        grandTotal={grandTotal}
        onCopyPress={handleCopy}
        onResetPress={handleReset}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  // 슬롯 선택 바
  slotBar: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  slotScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  slotTab: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  slotTabTouchArea: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  slotNameInput: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 70,
    backgroundColor: COLORS.card,
    borderRadius: 4,
    margin: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  slotTabActive: {
    backgroundColor: COLORS.primary + '25',
    borderColor: COLORS.primary,
  },
  slotTabText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  slotTabTextActive: {
    color: COLORS.primary,
  },
  slotHint: {
    color: COLORS.textMuted,
    fontSize: 9,
    marginTop: 1,
  },
  slotDeleteBar: {
    backgroundColor: COLORS.danger + '20',
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  slotDeleteBarPressed: {
    backgroundColor: COLORS.danger + '50',
  },
  slotDeleteBarText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  slotAddBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '20',
    borderWidth: 1,
    borderColor: COLORS.primary + '50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotAddText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  // 1부/2부
  sessionPartRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  sessionPartBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    alignItems: 'center',
  },
  sessionPartBtnActive: {
    backgroundColor: COLORS.primary + '25',
    borderColor: COLORS.primary,
  },
  sessionPartText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  sessionPartTextActive: {
    color: COLORS.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inputGroup: {
    flexBasis: '47%',
    flexGrow: 1,
    minWidth: 0,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 12,
    height: 44,
    color: COLORS.text,
    fontSize: 16,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
  tcAutoBox: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  tcAutoLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 4,
  },
  tcAutoValue: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
  },
  tcRefBox: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    gap: 4,
    marginTop: 10,
  },
  tcRefTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  roomTypeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  roomTypeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  roomTypeBtnActive: {
    backgroundColor: COLORS.primary + '30',
    borderColor: COLORS.primary,
  },
  roomTypeBtnText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  roomTypeBtnTextActive: {
    color: COLORS.primary,
  },
  tcRefText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  tcRefVal: {
    color: COLORS.text,
    fontWeight: '600',
  },
  tcRefHighlight: {
    color: COLORS.success,
    fontWeight: '700',
  },
  tcRefSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  tcFracRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  tcFracText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  addBtn: {
    backgroundColor: COLORS.primary + '25',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.primary + '50',
  },
  addBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 20,
  },
});
