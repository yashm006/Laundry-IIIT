import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

export function WorkerEntryForm({ formData, setFormData, onSubmit, onClose }) {
  function handleAddItem() {
    const newItems = [...formData.items];
    newItems.push({ item_type: '', quantity: 1 });
    setFormData({ ...formData, items: newItems });
  }

  function handleRemoveItem(index) {
    const newItems = [];
    for (let i = 0; i < formData.items.length; i++) {
      if (i !== index) {
        newItems.push(formData.items[i]);
      }
    }
    setFormData({ ...formData, items: newItems });
  }

  function handleItemChange(index, field, value) {
    const newItems = [...formData.items];
    if (field === 'quantity') {
      newItems[index][field] = parseInt(value);
    } else {
      newItems[index][field] = value;
    }
    setFormData({ ...formData, items: newItems });
  }

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Add New Entry</h3>
        <Button
          data-testid="close-form-btn"
          onClick={onClose}
          variant="ghost"
          size="sm"
        >
          <X size={18} />
        </Button>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="student_id">Student ID</Label>
            <Input
              id="student_id"
              data-testid="form-student-id-input"
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="student_name">Student Name</Label>
            <Input
              id="student_name"
              data-testid="form-student-name-input"
              value={formData.student_name}
              onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Items</Label>
          {formData.items.map(function(item, index) {
            const showRemove = formData.items.length > 1;
            return (
              <div key={index} className="flex gap-3">
                <Input
                  placeholder="Item type"
                  data-testid={`item-type-input-${index}`}
                  value={item.item_type}
                  onChange={(e) => handleItemChange(index, 'item_type', e.target.value)}
                  required
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  data-testid={`item-quantity-input-${index}`}
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  min="1"
                  className="w-32"
                  required
                />
                {showRemove && (
                  <Button
                    type="button"
                    data-testid={`remove-item-btn-${index}`}
                    onClick={() => handleRemoveItem(index)}
                    variant="ghost"
                    size="sm"
                  >
                    <X size={18} />
                  </Button>
                )}
              </div>
            );
          })}
          <Button
            type="button"
            data-testid="add-item-btn"
            onClick={handleAddItem}
            variant="outline"
            size="sm"
          >
            <Plus size={16} className="mr-2" />
            Add Item
          </Button>
        </div>

        <Button
          type="submit"
          data-testid="submit-entry-btn"
          className="w-full h-11 bg-primary hover:bg-primary/90"
        >
          Create Entry
        </Button>
      </form>
    </div>
  );
}