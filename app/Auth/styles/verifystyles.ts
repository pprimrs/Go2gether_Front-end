import { StyleSheet } from 'react-native';

const PRIMARY = '#9ACBE2';
const TEXT = '#111111';
const MUTED = '#6B6B6B';

export const styles = StyleSheet.create({
  headerRow: {
    alignSelf: 'stretch',
    paddingHorizontal: 34,
  },
  backBtn: {
    marginTop: 10,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },

  logo: {
    width: 300,
    height: 130,
    marginTop: -10,
  },
  title: {
    marginTop: 30,
    fontSize: 22,
    fontWeight: '800',
    color: TEXT,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
  },
  emailText: { color: TEXT, fontWeight: '600' },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    width: '90%',
  },
  otpInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#E9EBEE',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: TEXT,
  },

  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  resendText: { fontSize: 14, color: MUTED },
  resendLink: { fontSize: 14, color: '#2f6fa0', fontWeight: '600' },

  // 🔹 ปุ่ม Verify ตอนเริ่ม (เทา)
  verifyBtn: {
    width: '90%',
    height: 52,
    backgroundColor: '#E9EBEE',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 70,
  },
  // 🔹 ปุ่ม Verify เมื่อพิมพ์ครบ 6 ตัว (active)
  verifyBtnActive: {
    backgroundColor: PRIMARY,
  },
  verifyText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#555', // สีเทาตอน disable
  },
  verifyTextActive: {
    color: '#0B2A3A', // สีเข้มตอน active
  },

  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
});
