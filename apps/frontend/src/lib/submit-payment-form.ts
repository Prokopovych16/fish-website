export type CheckoutFormResult = {
  provider: string;
  action: string;
  method: 'GET' | 'POST';
  fields: Record<string, string | string[]>;
};

/**
 * Будує і відправляє форму оплати на основі генеричної відповіді бекенду.
 * Працює однаково незалежно від платіжного провайдера (WayForPay, LiqPay тощо) —
 * фронтенд не знає і не повинен знати специфіку конкретного шлюзу.
 */
export function submitPaymentForm({ action, method, fields }: CheckoutFormResult) {
  const form = document.createElement('form');
  form.method = method;
  form.action = action;
  form.style.display = 'none';

  for (const [name, value] of Object.entries(fields)) {
    const values = Array.isArray(value) ? value : [value];
    for (const v of values) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = v;
      form.appendChild(input);
    }
  }

  document.body.appendChild(form);
  form.submit();
}
