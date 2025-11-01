import { StyleSheet } from 'react-native';

const TEXT = '#111111';
const MUTED = '#6B6B6B';
const PRIMARY = '#9ACBE2';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
  },

    headerRow: {
    alignSelf: 'stretch',
    paddingHorizontal: 34,
    
  },

   backBtn: {
    marginTop: 15,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },

  logo: { width: 300, height: 150, marginTop: -40 },

  title: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: '800',
    color: TEXT,
  },
  subtitle: {
    marginTop: 25,
    fontSize: 14,
    color: '#969696',
    textAlign: 'center',
  },

  illustration: {
    width: 250,
    height: 200,
    marginTop: 45,
    marginBottom: 45,
  },

  inputWrap: {
    marginTop: 20,
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
  inputWrapError: {
    borderColor: '#EF4444',
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
    marginTop: 6,
    paddingHorizontal: 4,
  },

  btn: {
    alignSelf: 'stretch',
    marginTop: 25,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
  },
  btnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B2A3A',
  },
});
