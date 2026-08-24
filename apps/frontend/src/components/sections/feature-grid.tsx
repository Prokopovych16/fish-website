const features = [
  {
    title: 'Від виробника',
    description: 'Без посередників і торгових націнок — ціна напряму з нашого виробництва у Хмільнику.',
  },
  {
    title: 'Без хімії',
    description: 'Жодних консервантів, підсилювачів смаку чи рідкого диму. Тільки риба, сіль і натуральна тирса.',
  },
  {
    title: 'Доставка по Україні',
    description: 'Нова Пошта в будь-яке місто — замовляйте онлайн і отримуйте за 1-2 дні.',
  },
  {
    title: 'HACCP-виробництво',
    description: 'Сертифіковане виробництво з обов\'язковим контролем якості кожної партії.',
  },
];

export function FeatureGrid() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {features.map((feature) => (
        <article key={feature.title} className="rounded-xl border border-dark/10 bg-white p-6">
          <p className="text-sm font-semibold text-dark">{feature.title}</p>
          <p className="mt-3 text-sm leading-relaxed text-dark-500">{feature.description}</p>
        </article>
      ))}
    </section>
  );
}
