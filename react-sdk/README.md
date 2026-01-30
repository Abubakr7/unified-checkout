# CyberSource Unified Checkout React SDK

Легкая интеграция CyberSource Unified Checkout в любой React проект (маркетплейс, e-commerce и т.д.)

## Установка

Скопируйте папку `react-sdk/src` в свой проект или установите как npm пакет:

```bash
# Копирование файлов
cp -r react-sdk/src your-project/src/lib/checkout

# Или установка зависимостей
cd react-sdk && npm install
```

## Быстрый старт

### Вариант 1: Готовый компонент (самый простой)

```tsx
import { UnifiedCheckout } from './lib/checkout';

function CheckoutPage() {
  const handlePaymentComplete = (response) => {
    console.log('Оплата успешна!', response);
    // Редирект на страницу успеха
    window.location.href = '/order-success';
  };

  const handlePaymentError = (error) => {
    console.error('Ошибка оплаты:', error);
    alert('Ошибка при оплате: ' + error.message);
  };

  return (
    <div className="checkout-page">
      <h1>Оформление заказа</h1>

      {/* Корзина товаров */}
      <div className="cart">
        <p>Товар 1 - $10.00</p>
        <p>Товар 2 - $15.00</p>
        <p><strong>Итого: $25.00</strong></p>
      </div>

      {/* Платежный виджет */}
      <UnifiedCheckout
        apiBaseUrl="https://your-backend.com/api"
        orderAmount="25.00"
        currency="USD"
        onPaymentComplete={handlePaymentComplete}
        onPaymentError={handlePaymentError}
      />
    </div>
  );
}
```

### Вариант 2: Использование хука (больше контроля)

```tsx
import { useCheckout } from './lib/checkout';

function CustomCheckout({ cart }) {
  const {
    isLoading,
    error,
    generateCaptureContext,
    startCheckout,
    paymentResult,
  } = useCheckout({
    apiBaseUrl: 'https://your-backend.com/api',
    onPaymentComplete: (response) => {
      // Сохранить заказ в вашей системе
      saveOrder(cart, response);
    },
  });

  const handleCheckout = async () => {
    // 1. Генерируем capture context с данными заказа
    await generateCaptureContext({
      targetOrigins: [window.location.origin],
      clientVersion: '0.26',
      allowedCardNetworks: ['VISA', 'MASTERCARD'],
      allowedPaymentTypes: ['PANENTRY', 'GOOGLEPAY'],
      country: 'US',
      locale: 'en_US',
      captureMandate: {
        billingType: 'FULL',
        requestEmail: true,
        requestPhone: true,
        requestShipping: true,
        shipToCountries: ['US'],
        showAcceptedNetworkIcons: true,
      },
      completeMandate: {
        type: 'AUTH',
        decisionManager: true,
      },
      orderInformation: {
        amountDetails: {
          totalAmount: cart.total.toString(),
          currency: 'USD',
        },
      },
    });

    // 2. Запускаем виджет оплаты
    await startCheckout('#payment-container', true);
  };

  if (paymentResult?.success) {
    return <div>Оплата прошла успешно!</div>;
  }

  return (
    <div>
      <button onClick={handleCheckout} disabled={isLoading}>
        {isLoading ? 'Загрузка...' : 'Оплатить'}
      </button>

      {error && <p className="error">{error.message}</p>}

      {/* Контейнер для виджета CyberSource */}
      <div id="payment-container" />
    </div>
  );
}
```

### Вариант 3: Только API клиент (максимальная гибкость)

```tsx
import { createCheckoutApi } from './lib/checkout';

const api = createCheckoutApi('https://your-backend.com/api');

// Использование в любом месте
async function processPayment(orderData) {
  // 1. Получить capture context
  const captureResponse = await api.generateCaptureContext(orderData);

  // 2. Подготовить checkout
  const checkoutResponse = await api.prepareCheckout(
    captureResponse.data.captureContext,
    captureResponse.data.decodedData
  );

  // 3. Загрузить SDK и показать виджет
  // ... ваша логика
}
```

## API Endpoints (Backend)

SDK ожидает следующие endpoints на вашем бэкенде:

| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/api/health` | Health check |
| GET | `/api/config` | Дефолтная конфигурация |
| POST | `/api/capture-context` | Генерация capture context JWT |
| POST | `/api/checkout` | Подготовка данных для checkout |
| POST | `/api/complete-payment` | Обработка результата платежа |

## Компонент UnifiedCheckout - Props

| Prop | Тип | Обязательный | Описание |
|------|-----|--------------|----------|
| `apiBaseUrl` | string | Да | URL вашего backend API |
| `orderAmount` | string | Да | Сумма заказа (напр. "99.99") |
| `currency` | string | Да | Валюта (USD, EUR и т.д.) |
| `onPaymentComplete` | function | Нет | Callback при успешной оплате |
| `onPaymentError` | function | Нет | Callback при ошибке |
| `allowedCardNetworks` | string[] | Нет | Разрешенные сети карт |
| `allowedPaymentTypes` | string[] | Нет | Типы оплаты (PANENTRY, GOOGLEPAY, etc) |
| `useSidebar` | boolean | Нет | Показывать как sidebar (default: true) |
| `className` | string | Нет | CSS класс для контейнера |
| `style` | object | Нет | Inline стили |
| `loadingComponent` | ReactNode | Нет | Кастомный loading компонент |
| `errorComponent` | function | Нет | Кастомный error компонент |

## Хук useCheckout - Return

```typescript
{
  // Состояние
  isLoading: boolean;
  error: Error | null;
  captureContext: string | null;
  checkoutData: CheckoutData | null;
  paymentResult: PaymentResponse | null;

  // Методы
  generateCaptureContext: (config) => Promise<void>;
  startCheckout: (containerId, useSidebar?) => Promise<void>;
  reset: () => void;

  // API для прямого доступа
  api: CheckoutApi;
}
```

## Пример интеграции в маркетплейс

```tsx
// pages/checkout/index.tsx
import { UnifiedCheckout } from '@/lib/checkout';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/router';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const total = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <Layout>
      <div className="grid grid-cols-2 gap-8">
        {/* Левая колонка - корзина */}
        <div>
          <h2>Ваш заказ</h2>
          {cart.items.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
          <p className="total">Итого: ${total.toFixed(2)}</p>
        </div>

        {/* Правая колонка - оплата */}
        <div>
          <h2>Оплата</h2>
          <UnifiedCheckout
            apiBaseUrl={process.env.NEXT_PUBLIC_API_URL}
            orderAmount={total.toFixed(2)}
            currency="USD"
            onPaymentComplete={(res) => {
              clearCart();
              router.push(`/order-success?id=${res.data?.decodedData?.orderNumber}`);
            }}
            onPaymentError={(err) => {
              toast.error('Ошибка: ' + err.message);
            }}
          />
        </div>
      </div>
    </Layout>
  );
}
```

## Структура файлов

```
react-sdk/src/
├── index.ts              # Главный экспорт
├── api/
│   └── checkoutApi.ts    # API клиент
├── components/
│   └── UnifiedCheckout.tsx  # Готовый компонент
├── hooks/
│   └── useCheckout.ts    # React хук
└── types/
    └── index.ts          # TypeScript типы
```
