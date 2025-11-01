import { StyleSheet } from 'react-native';

const TEXT = '#111111';
const MUTED = '#6B6B6B';
const PRIMARY = '#9ACBE2';

export const styles = StyleSheet.create({
  headerRow: {
    alignSelf: 'stretch',
    paddingHorizontal: 24,
    marginTop: 4,
  },
  backBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },

  logo: { width: 300, height: 130, marginTop: -8 },

  title: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: '800',
    color: TEXT,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    color: '#969696',
    textAlign: 'center',
  },

  inputWrap: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'stretch',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: '#E6ECF3',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },

  errorText: {
    alignSelf: 'stretch',
    color: '#EF4444',
    fontSize: 12,
    marginTop: 10,
    paddingHorizontal: 4,
  },

  btn: {
    alignSelf: 'stretch',
    marginTop: 28,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9EBEE', // เทาก่อน active
  },
  btnActive: {
    backgroundColor: PRIMARY,
  },
  btnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  btnTextActive: {
    color: '#0B2A3A',
  },
});
