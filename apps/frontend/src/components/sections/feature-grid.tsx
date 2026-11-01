import { Factory, Leaf, ShieldCheck, Truck } from 'lucide-react';
import { Reveal } from '../shared/interactive';
import { iconChipClass, tileClass } from '../../lib/ui-classes';

const features = [
  {
    icon: Factory,
    title: 'Від виробника',
    description: 'Без посередників і торгових націнок — ціна напряму з нашого виробництва у Хмільнику.',
  },
  {
    icon: Leaf,
    title: 'Без хімії',
    description: 'Жодних консервантів, підсилювачів смаку чи рідкого диму. Тільки риба, сіль і натуральна тирса.',
  },
  {
    icon: Truck,
    title: 'Доставка по Україні',
    description: 'Нова Пошта в будь-яке місто — замовляйте онлайн і отримуйте за 1-2 дні.',
  },
  {
    icon: ShieldCheck,
    title: 'HACCP-виробництво',
    description: 'Сертифіковане виробництво з обов\'язковим контролем якості кожної партії.',
  },
];

export function FeatureGrid() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {features.map((feature, i) => (
        <Reveal key={feature.title} index={i} className="h-full">
          <article className={`${tileClass} h-full p-6`}>
            <div className={iconChipClass}>
              <feature.icon className="h-5 w-5" />
            </div>
            <p className="mt-5 text-sm font-semibold text-dark">{feature.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-dark-500">{feature.description}</p>
          </article>
        </Reveal>
      ))}
    </section>
  );
}
