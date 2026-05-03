import { UserInput } from '../whatsapp/types';
import { SessionData, sessionStore } from '../redis/session';
import { whatsappClient } from '../whatsapp/client';
import { prisma } from '../db/client';
import { State } from '../conversation/states';
import { t, type Language } from '../locales';

export async function handleBranchMenu(input: UserInput, session: SessionData): Promise<void> {
  const lang = (session.language || 'ru') as Language;
  const selection = input.listId || input.buttonId;

  if (selection === 'bmenu_prices') {
    await sessionStore.update(input.phone, { state: State.BRANCH_PRICES });
    const { handleBranchPrices } = await import('./branch-prices');
    await handleBranchPrices(input, { ...session, state: State.BRANCH_PRICES });
    return;
  }

  if (selection === 'bmenu_classes') {
    await sessionStore.update(input.phone, { state: State.GROUP_CLASSES });
    const { handleGroupClasses } = await import('./group-classes');
    await handleGroupClasses(input, { ...session, state: State.GROUP_CLASSES });
    return;
  }

  if (selection === 'bmenu_trainers') {
    await sessionStore.update(input.phone, { state: State.TRAINERS });
    const { handleTrainers } = await import('./trainers');
    await handleTrainers(input, { ...session, state: State.TRAINERS });
    return;
  }

  if (selection === 'bmenu_manager') {
    await sessionStore.update(input.phone, { state: State.CONTACT_MANAGER });
    const { handleContactManager } = await import('./contact-manager');
    await handleContactManager(input, session);
    return;
  }

  if (selection === 'back_branches') {
    await sessionStore.update(input.phone, { state: State.BRANCH_SELECTION, previousState: State.BRANCH_MENU });
    const { handleBranchSelection } = await import('./branch-selection');
    await handleBranchSelection(input, session);
    return;
  }

  // Show branch menu
  const branch = session.branchId
    ? await (prisma as any).branch.findFirst({ where: { id: session.branchId } })
    : null;

  if (!branch) {
    // No branch selected, go to selection
    await sessionStore.update(input.phone, { state: State.BRANCH_SELECTION, previousState: State.BRANCH_MENU });
    const { handleBranchSelection } = await import('./branch-selection');
    await handleBranchSelection(input, session);
    return;
  }

  // Localized menu items
  const menuItems = {
    prices: {
      title: t(lang, 'branchMenu.prices'),
      description: lang === 'kk' ? 'Абонементтер мен тарифтер' : lang === 'en' ? 'Memberships & rates' : 'Абонементы и тарифы'
    },
    classes: {
      title: t(lang, 'branchMenu.classes'),
      description: lang === 'kk' ? 'Сабақ кестесі' : lang === 'en' ? 'Class schedule' : 'Расписание занятий'
    },
    trainers: {
      title: t(lang, 'branchMenu.trainers'),
      description: lang === 'kk' ? 'Мамандар' : lang === 'en' ? 'Our specialists' : 'Наши специалисты'
    },
    manager: {
      title: t(lang, 'branchMenu.manager'),
      description: lang === 'kk' ? 'Байланыс' : lang === 'en' ? 'Contact' : 'Связаться'
    },
    back: {
      title: t(lang, 'back'),
      description: lang === 'kk' ? 'Филиалды таңдауға' : lang === 'en' ? 'To branch selection' : 'К выбору филиала'
    },
  };

  const selectedText = lang === 'kk' ? 'Сіз таңдадыңыз:' : lang === 'en' ? 'You selected:' : 'Вы выбрали:';

  await whatsappClient.sendList(
    input.phone,
    `${t(lang, 'branchMenu.selected')} ${branch.name} 🏋️‍♀️\n${t(lang, 'branchMenu.address')} ${branch.address}\n\n${t(lang, 'branchMenu.interested')}`,
    t(lang, 'select'),
    [
      {
        title: branch.name,
        rows: [
          { id: 'bmenu_prices', title: menuItems.prices.title, description: menuItems.prices.description },
          { id: 'bmenu_classes', title: menuItems.classes.title, description: menuItems.classes.description },
          { id: 'bmenu_trainers', title: menuItems.trainers.title, description: menuItems.trainers.description },
          { id: 'bmenu_manager', title: menuItems.manager.title, description: menuItems.manager.description },
          { id: 'back_branches', title: menuItems.back.title, description: menuItems.back.description },
        ],
      },
    ]
  );

  await sessionStore.update(input.phone, { state: State.BRANCH_MENU });
}
