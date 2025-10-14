// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure proper handling of web assets
config.resolver.assetExts.push(
  // Fonts
  'otf',
  'ttf',
  'woff',
  'woff2',
  // Images
  'webp',
  'svg'
);

// Ensure proper handling of web modules
config.resolver.sourceExts.push('web.js', 'web.ts', 'web.tsx');

// Add path aliases - ensure they work for web platform
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
  '@/components': path.resolve(__dirname, './components'),
  '@/hooks': path.resolve(__dirname, './hooks'),
  '@/api': path.resolve(__dirname, './src/api'),
  '@/types': path.resolve(__dirname, './src/types'),
  '@/utils': path.resolve(__dirname, './src/utils'),
  '@/config': path.resolve(__dirname, './src/config'),
  '@/constants': path.resolve(__dirname, './src/constants'),
  '@/store': path.resolve(__dirname, './src/store'),
};

// Ensure proper module resolution for web
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Override the resolver to handle @ aliases more explicitly
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle @ aliases explicitly
  if (moduleName.startsWith('@/')) {
    const aliasPath = moduleName.replace('@/', './');
    const resolvedPath = path.resolve(__dirname, aliasPath);
    
    // Try to resolve with different extensions
    const extensions = ['.tsx', '.ts', '.js', '.jsx', '.web.tsx', '.web.ts', '.web.js', '.web.jsx'];
    
    for (const ext of extensions) {
      const fullPath = resolvedPath + ext;
      if (require('fs').existsSync(fullPath)) {
        return {
          type: 'sourceFile',
          filePath: fullPath,
        };
      }
    }
    
    // If no file found, try as directory with index
    for (const ext of extensions) {
      const fullPath = path.join(resolvedPath, 'index' + ext);
      if (require('fs').existsSync(fullPath)) {
        return {
          type: 'sourceFile',
          filePath: fullPath,
        };
      }
    }
  }
  
  // Fall back to original resolver
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
