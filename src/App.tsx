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
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <GithubCorner />
        <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700 mb-6">
          {(['foods', 'medicines', 'settings'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 -mb-px text-sm font-medium transition-colors focus:outline-none ${
                activeTab === tab
                  ? 'border-b-2 border-violet-400 text-violet-300'
                  : 'text-slate-400 hover:text-slate-200 border-b-2 border-transparent'
              }`}
            >
              {t(tab === 'settings' ? 'options' : tab)}
            </button>
          ))}
        </div>

        {activeTab === 'foods' && (
          <FoodsTab
            onAddItem={() => openAdd('foods')}
            onEditItem={(item) => setEditingItem({ item, category: 'foods' })}
          />
        )}
        {activeTab === 'medicines' && (
          <MedicinesTab
            onAddItem={() => openAdd('medicines')}
            onEditItem={(item) => setEditingItem({ item, category: 'medicines' })}
          />
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
