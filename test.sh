#!/bin/bash

echo "🚀 Fixing TypeScript issues..."

# 1️⃣ Voeg ontbrekende properties toe aan 'Category' in types/index.ts
echo "🛠️ Updating Category type..."
sed -i '' '/interface Category {/a\
  vision?: string;\
  purpose?: string;\
  threeToThrive?: string[];\
  resources?: string;\
  results?: { result: string; date: string }[];\
  actionPlans?: string[];
' types/index.ts

# 2️⃣ Verwijder dubbele property-declaraties
echo "🧹 Removing duplicate properties..."
sed -i '' '/vision/d' types/index.ts
sed -i '' '/purpose/d' types/index.ts
sed -i '' '/threeToThrive/d' types/index.ts
sed -i '' '/resources/d' types/index.ts
sed -i '' '/results/d' types/index.ts
sed -i '' '/actionPlans/d' types/index.ts

# 3️⃣ Fix incorrect fieldArray name assignments in category-dialog.tsx
echo "🔧 Fixing useFieldArray assignments..."
sed -i '' 's/useFieldArray({ control: form.control, name: "threeToThrive" })/useFieldArray({ control: form.control, name: "threeToThrive" as const })/' components/categories/category-dialog.tsx
sed -i '' 's/useFieldArray({ control: form.control, name: "results" })/useFieldArray({ control: form.control, name: "results" as const })/' components/categories/category-dialog.tsx
sed -i '' 's/useFieldArray({ control: form.control, name: "actionPlans" })/useFieldArray({ control: form.control, name: "actionPlans" as const })/' components/categories/category-dialog.tsx

# 4️⃣ Fix 'result' en 'date' die niet op 'string' bestaan
echo "🔧 Fixing result and date mapping..."
sed -i '' 's/results: category?.results?.map(result => ({ result: result, date: "" })) || \[\],/results: category?.results?.map((result: { result: string; date: string }) => ({ result: result.result, date: result.date })) || \[\],/' components/categories/category-dialog.tsx

# 5️⃣ Fix missing 'incantations' property in Role type
echo "🛠️ Adding missing 'incantations' property to Role type..."
sed -i '' 's/interface Role {/interface Role {\n  incantations: string[];/' types/index.ts

# 6️⃣ Fix implicit 'any' in category-dialog.tsx
echo "🔧 Fixing implicit 'any' types..."
sed -i '' 's/\(r\) =>/(\r: any) =>/' components/categories/category-dialog.tsx

# 7️⃣ Fix `onOpenChange` en `onSave`
echo "🔧 Fixing onOpenChange and onSave issues..."
sed -i '' 's/onOpenChange/onOpenChange={(open) => setIsOpen(open)}/' components/categories/category-dialog.tsx
sed -i '' 's/onSave(newCategory)/onSave?.(newCategory)/' components/categories/category-dialog.tsx

# 8️⃣ Voeg een correcte newCategory declaratie toe
echo "🛠️ Ensuring newCategory declaration exists..."
if ! grep -q "const newCategory: Category" components/categories/category-dialog.tsx; then
  sed -i '' '/const form = useForm(/i\
  const newCategory: Category = {\
    id: "",\
    name: "",\
    type: "personal",\
    description: "",\
    roles: [],\
    vision: "",\
    purpose: "",\
    threeToThrive: [],\
    resources: "",\
    results: [],\
    actionPlans: []\
  };\
  ' components/categories/category-dialog.tsx
fi

# 9️⃣ Fix TypeScript-configuratie om moduleproblemen op te lossen
echo "🔧 Updating tsconfig.json..."
sed -i '' 's/"moduleResolution": "bundler"/"moduleResolution": "node"/' tsconfig.json
sed -i '' 's/"module": "esnext"/"module": "commonjs"/' tsconfig.json
sed -i '' 's/"jsx": "preserve"/"jsx": "react-jsx"/' tsconfig.json

# 🔟 Fix duplicate import issues in tests
echo "🛠️ Removing duplicate imports from test files..."
find test/api -name "*.test.ts" -exec sed -i '' '/import { GET, POST, PUT, DELETE } from/d' {} \;
find test/api -name "*.test.ts" -exec sed -i '' '/import { NextRequest } from/d' {} \;
find test/api -name "*.test.ts" -exec sed -i '' '/import fs from/d' {} \;
find test/api -name "*.test.ts" -exec sed -i '' '/import path from/d' {} \;

# 🔄 Clean en herinstalleer dependencies
echo "🧹 Cleaning up dependencies..."
rm -rf node_modules
rm -f package-lock.json
rm -rf .next
npm install

# 🚀 Run TypeScript build check
echo "🔧 Running TypeScript build check..."
npm run build

# 🎯 Start development server
echo "🚀 Starting application..."
npm run dev