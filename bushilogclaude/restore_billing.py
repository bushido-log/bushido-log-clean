with open("App.tsx", "r") as f:
    content = f.read()

# 1. purchaseServiceのインポート追加
old1 = "import { WebView } from 'react-native-webview';"
new1 = """import { WebView } from 'react-native-webview';
import { initializePurchases, checkProStatus, getOffering, purchasePro, restorePurchases, getMonthlyPrice } from './src/services/purchaseService';
import { PurchasesPackage } from 'react-native-purchases';"""
content = content.replace(old1, new1)

# 2. SAMURAI_TIME_KEYの後に課金関連の定数追加
old2 = "const SAMURAI_TIME_KEY = 'BUSHIDO_SAMURAI_TIME_V1';"
new2 = """const SAMURAI_TIME_KEY = 'BUSHIDO_SAMURAI_TIME_V1';
const SAMURAI_KING_USES_KEY = 'SAMURAI_KING_USES_V1';
const FIRST_LAUNCH_KEY = 'BUSHIDO_FIRST_LAUNCH_V1';
const FREE_TRIAL_DAYS = 3;"""
content = content.replace(old2, new2)

# 3. settings stateの後に課金関連State追加
old3 = "const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);"
new3 = """const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  // 課金関連
  const [isPro, setIsPro] = useState(false);
  const [trialExpired, setTrialExpired] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [currentOffering, setCurrentOffering] = useState<PurchasesPackage | null>(null);
  const [monthlyPrice, setMonthlyPrice] = useState('¥700/月');
  const [samuraiKingUses, setSamuraiKingUses] = useState(0);"""
content = content.replace(old3, new3)

with open("App.tsx", "w") as f:
    f.write(content)

print("Step 1 done - imports and state added!")