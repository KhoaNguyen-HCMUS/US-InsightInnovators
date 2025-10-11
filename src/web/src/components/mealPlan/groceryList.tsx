import { useState } from 'react';
import type { GroceryItem } from '../../types/mealPlan';
import { FaShoppingCart, FaCheck, FaTimes, FaPlus, FaMinus, FaTrash, FaDownload, FaPrint, FaFilter } from 'react-icons/fa';

interface GroceryListProps {
  groceryList: GroceryItem[];
  onClose: () => void;
  onUpdateItem: (index: number, item: GroceryItem) => void;
  onDeleteItem: (index: number) => void;
  onAddItem: (item: GroceryItem) => void;
}

export default function GroceryList({ 
  groceryList, 
  onClose, 
  onUpdateItem, 
  onDeleteItem, 
  onAddItem 
}: GroceryListProps) {
  const [filter, setFilter] = useState<'all' | 'checked' | 'unchecked'>('all');
  const [sortBy, setSortBy] = useState<'category' | 'name' | 'cost'>('category');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState<Partial<GroceryItem>>({
    name: '',
    category: 'other',
    amount: 1,
    unit: 'piece',
    estimatedCost: 0,
    isChecked: false
  });

  const categories = [
    'protein', 'vegetable', 'fruit', 'dairy', 'grain', 'spice', 'other'
  ];

  const filteredList = groceryList.filter(item => {
    switch (filter) {
      case 'checked': return item.isChecked;
      case 'unchecked': return !item.isChecked;
      default: return true;
    }
  });

  const sortedList = [...filteredList].sort((a, b) => {
    switch (sortBy) {
      case 'category':
        return a.category.localeCompare(b.category);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'cost':
        return b.estimatedCost - a.estimatedCost;
      default:
        return 0;
    }
  });

  const totalCost = groceryList.reduce((sum, item) => sum + item.estimatedCost, 0);
  const checkedItems = groceryList.filter(item => item.isChecked).length;
  const totalItems = groceryList.length;

  const toggleItem = (index: number) => {
    const item = groceryList[index];
    onUpdateItem(index, { ...item, isChecked: !item.isChecked });
  };

  const updateItemAmount = (index: number, amount: number) => {
    const item = groceryList[index];
    onUpdateItem(index, { ...item, amount: Math.max(0.1, amount) });
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.category && newItem.amount && newItem.unit) {
      onAddItem(newItem as GroceryItem);
      setNewItem({
        name: '',
        category: 'other',
        amount: 1,
        unit: 'piece',
        estimatedCost: 0,
        isChecked: false
      });
      setIsAddingItem(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      protein: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      vegetable: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      fruit: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      dairy: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      grain: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      spice: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const exportList = () => {
    const listText = groceryList
      .map(item => `${item.isChecked ? '✓' : '☐'} ${item.name} - ${item.amount} ${item.unit}`)
      .join('\n');
    
    const blob = new Blob([listText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grocery-list.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" >
      <div className="bg-bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-light">
          <div className="flex items-center">
            <div className="p-2 bg-primary rounded-lg mr-3">
              <FaShoppingCart className="text-primary-contrast text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-header">
                Grocery List
              </h2>
              <p className="text-sm text-text-body">
                {checkedItems}/{totalItems} items checked • ${totalCost.toFixed(2)} total
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-body hover:text-text-header hover:bg-bg-muted rounded-lg transition-colors"
            aria-label="Close Grocery List"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-border-light">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Filter */}
              <div className="flex items-center space-x-2">
                <FaFilter className="text-text-body" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'checked' | 'unchecked')}
                  className="px-3 py-1 border border-border-light rounded bg-bg text-text-body"
                  aria-label="Filter grocery items"
                >
                  <option value="all">All Items</option>
                  <option value="unchecked">Unchecked</option>
                  <option value="checked">Checked</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <span className="text-text-body">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'category' | 'name' | 'cost')}
                  className="px-3 py-1 border border-border-light rounded bg-bg text-text-body"
                  aria-label="Sort grocery items"
                >
                  <option value="category">Category</option>
                  <option value="name">Name</option>
                  <option value="cost">Cost</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={exportList}
                className="inline-flex items-center px-3 py-1 text-text-body hover:text-text-header transition-colors"
                aria-label="Export grocery list"
              >
                <FaDownload className="mr-1" />
                Export
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center px-3 py-1 text-text-body hover:text-text-header transition-colors"
                aria-label="Print grocery list"
              >
                <FaPrint className="mr-1" />
                Print
              </button>
            </div>
          </div>

          {/* Add Item */}
          {isAddingItem ? (
            <div className="bg-bg-muted rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <input
                  type="text"
                  placeholder="Item name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="px-3 py-2 border border-border-light rounded bg-bg text-text-body"
                />
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="px-3 py-2 border border-border-light rounded bg-bg text-text-body"
                  aria-label="Select category"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  value={newItem.amount}
                  onChange={(e) => setNewItem({ ...newItem, amount: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border border-border-light rounded bg-bg text-text-body"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  className="px-3 py-2 border border-border-light rounded bg-bg text-text-body"
                />
                <input
                  type="number"
                  placeholder="Cost"
                  value={newItem.estimatedCost}
                  onChange={(e) => setNewItem({ ...newItem, estimatedCost: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border border-border-light rounded bg-bg text-text-body"
                />
                <div className="flex space-x-1">
                  <button
                    onClick={handleAddItem}
                    className="p-2 bg-primary text-primary-contrast rounded hover:bg-primary/90"
                    aria-label="Add grocery item"
                  >
                    <FaCheck />
                  </button>
                  <button
                    onClick={() => setIsAddingItem(false)}
                    className="p-2 bg-bg-muted text-text-body rounded hover:bg-bg-muted/80"
                    aria-label="Cancel adding item"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingItem(true)}
              className="inline-flex items-center px-4 py-2 bg-secondary hover:bg-secondary/90 text-secondary-contrast rounded-lg font-medium transition-colors"
            >
              <FaPlus className="mr-2" />
              Add Item
            </button>
          )}
        </div>

        {/* Grocery List */}
        <div className="p-6">
          {sortedList.length === 0 ? (
            <div className="text-center py-8">
              <FaShoppingCart className="text-4xl text-text-muted mx-auto mb-4" />
              <p className="text-text-body">No items match your current filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedList.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center p-4 rounded-lg border transition-all ${
                    item.isChecked
                      ? 'bg-bg-muted border-border-light opacity-75'
                      : 'bg-bg border-border-light hover:border-primary/50'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleItem(index)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center mr-4 transition-colors ${
                      item.isChecked
                        ? 'bg-primary border-primary text-primary-contrast'
                        : 'border-border-light hover:border-primary'
                    }`}
                  >
                    {item.isChecked && <FaCheck className="text-sm" />}
                  </button>

                  {/* Item Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-medium ${item.isChecked ? 'line-through text-text-muted' : 'text-text-header'}`}>
                          {item.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                          <span className="text-sm text-text-body">
                            {item.amount} {item.unit}
                          </span>
                          {item.notes && (
                            <span className="text-sm text-text-body italic">
                              • {item.notes}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-text-header">
                          ${item.estimatedCost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => updateItemAmount(index, item.amount - 0.1)}
                      className="p-1 text-text-body hover:text-text-header transition-colors"
                      aria-label={`Decrease amount of ${item.name}`}
                    >
                      <FaMinus className="text-sm" />
                    </button>
                    <span className="text-sm text-text-body min-w-[3rem] text-center">
                      {item.amount}
                    </span>
                    <button
                      onClick={() => updateItemAmount(index, item.amount + 0.1)}
                      className="p-1 text-text-body hover:text-text-header transition-colors"
                      aria-label={`Increase amount of ${item.name}`}
                    >
                      <FaPlus className="text-sm" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(index)}
                      className="p-1 text-text-body hover:text-error transition-colors"
                      aria-label={`Delete ${item.name} from grocery list`}
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border-light bg-bg-muted">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-body">
              <p>Total estimated cost: <span className="font-semibold text-text-header">${totalCost.toFixed(2)}</span></p>
              <p>Items: {checkedItems} checked, {totalItems - checkedItems} remaining</p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-contrast rounded-lg font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
