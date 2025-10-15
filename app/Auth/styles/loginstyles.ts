import { StyleSheet } from 'react-native';

const TEXT = '#111111';
const MUTED = '#6B6B6B';
const CARD_BG = '#eaf4fb';
const BORDER = '#e7eef5';

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  logo: { width: 300, height: 150 },
  topSection: { marginTop: -35, alignItems: 'center', paddingTop: 90, paddingHorizontal: 10, paddingBottom: 8 },
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
  sheetContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 20, gap: 12 },

  googleBtn: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    alignSelf: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 53,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  googleText: { fontSize: 16, fontWeight: '700', color: '#000', flex: 1, textAlign: 'center' },
  orText: { textAlign: 'center', marginTop: 25, marginBottom: 25, color: MUTED, fontSize: 14 },

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
  },
  inputWrapError: {
    borderColor: '#EF4444',
  },
  input: { flex: 1, fontSize: 16, color: '#333' },
  smallRow: { flexDirection: 'row', alignItems: 'center' },

  errorText: {
    width: '85%',
    alignSelf: 'center',
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  formError: {
    width: '85%',
    alignSelf: 'center',
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    color: '#991B1B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    fontSize: 13,
  },

  forgot: { fontSize: 12, color: '#746E6E', marginTop: 8, alignSelf: 'stretch', textAlign: 'left', marginHorizontal: 34 },

  btn: {
    width: '85%',
    alignSelf: 'center',
    alignItems: 'center',
    height: 53,
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 16,
  },
  btnText: { fontSize: 20, fontWeight: '800' },
  btnPrimary: { marginTop: 12, backgroundColor: '#9ACBE2' },
  btnPrimaryText: { color: '#0B2A3A' },

  terms: { marginTop: 20, fontSize: 13, color: MUTED, textAlign: 'center' },
  link: { textDecorationLine: 'underline', color: '#2f6fa0', fontWeight: '600' },
});
