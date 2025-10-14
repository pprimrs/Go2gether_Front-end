import { StyleSheet } from 'react-native';

const TEXT = '#111111';
const MUTED = '#6B6B6B';
const CARD_BG = '#eaf4fb';
const BORDER = '#e7eef5';

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  logo: { width: 300, height: 150 },

  topSection: {
    marginTop: -35,
    alignItems: 'center',
    paddingTop: 90,
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  title: { fontSize: 25, fontWeight: '800', color: TEXT, marginTop: 8 },
  subtitle: { marginTop: 20, fontSize: 14, lineHeight: 18, color: '#959595', textAlign: 'center' },

  tabsOuterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: -15,
    borderBottomColor: '#c8d9eb',
  },
  tabBtn: { paddingHorizontal: 8, paddingVertical: 16 },
  tabText: { fontSize: 17, color: MUTED, fontWeight: '700' },
  tabActive: { color: '#2f6fa0', paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: '#2f6fa0' },

  bottomSheet: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: BORDER,
  },
  sheetContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 24, gap: 14 },

  inputWrap: {
    width: '85%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 53,
    borderWidth: 1,
    borderColor: '#eee',
    marginTop: 12,
  },
  input: { flex: 1, fontSize: 16, color: '#333' },
  smallRow: { flexDirection: 'row', alignItems: 'center' },

  // ปุ่มหลัก
  btn: {
    width: '85%',
    alignSelf: 'center',
    alignItems: 'center',
    height: 53,
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 24,
  },
  btnText: { fontSize: 20, fontWeight: '800' },

  // สีปุ่ม (พร้อมสถานะ disabled)
  btnPrimary: { backgroundColor: '#9ACBE2' },
  btnPrimaryDisabled: { backgroundColor: '#DCEBF3' }, // สีอ่อนเมื่อยังกรอกไม่ครบ
  btnPrimaryText: { color: '#0B2A3A' },
  btnDisabledText: { color: '#7C9AAA' },

  terms: { marginTop: 20, fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 18 },
  link: { textDecorationLine: 'underline', color: '#2f6fa0', fontWeight: '600' },
});
