import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FoodsTab from './components/FoodsTab';
import MedicinesTab from './components/MedicinesTab';
import SettingsTab from './components/SettingsTab';
import AddItemModal from './components/AddItemModal';
import EditItemModal from './components/EditItemModal';
import GithubCorner from './components/GithubCorner';
import type { Item, ItemCategory } from './types';

type Tab = 'foods' | 'medicines' | 'settings';

export default function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('foods');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addCategory, setAddCategory] = useState<ItemCategory>('foods');
  const [editingItem, setEditingItem] = useState<{ item: Item; category: ItemCategory } | null>(null);

  function openAdd(category: ItemCategory) {
    setAddCategory(category);
    setShowAddModal(true);
  }

  return (
    <div className="container py-3">
      <GithubCorner />
      <h1 className="mb-3">{t('title')}</h1>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'foods' ? 'active' : ''}`}
            onClick={() => setActiveTab('foods')}
          >
            {t('foods')}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'medicines' ? 'active' : ''}`}
            onClick={() => setActiveTab('medicines')}
          >
            {t('medicines')}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            {t('options')}
          </button>
        </li>
      </ul>

      <div>
        {activeTab === 'foods' && (
          <FoodsTab onAddItem={() => openAdd('foods')} onEditItem={(item) => setEditingItem({ item, category: 'foods' })} />
        )}
        {activeTab === 'medicines' && (
          <MedicinesTab onAddItem={() => openAdd('medicines')} onEditItem={(item) => setEditingItem({ item, category: 'medicines' })} />
        )}
        {activeTab === 'settings' && <SettingsTab />}
      </div>

      <AddItemModal
        show={showAddModal}
        category={addCategory}
        onClose={() => setShowAddModal(false)}
      />

      {editingItem && (
        <EditItemModal
          show={true}
          item={editingItem.item}
          category={editingItem.category}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}
