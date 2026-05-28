import React, { useState } from 'react';

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export default function SessionToolsPanel({
    character,
    conditions,
    isSaving,
    onToggleCondition,
    onDeathSaveChange,
    onHitDiceChange,
    onInventoryChange
}) {
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState('1');

    const activeConditions = character.conditions || [];
    const deathSaves = character.deathSaves || { successes: 0, failures: 0 };
    const level = Number(character.level) || 1;
    const hitDiceRemaining = Number(character.hitDiceRemaining) || 0;
    const inventory = character.inventory || [];

    function addInventoryItem() {
        const name = itemName.trim();
        const count = Math.max(1, Number(quantity) || 1);

        if (!name) {
            return;
        }

        onInventoryChange([...inventory, { name, quantity: count }]);
        setItemName('');
        setQuantity('1');
    }

    return (
        <div className="detail-section-grid">
            <div className="detail-panel" role="group" aria-label="Conditions">
                <h3>Conditions</h3>
                {conditions.length === 0 ? (
                    <p className="status-copy">No conditions seeded yet.</p>
                ) : (
                    <div className="spell-selector-list">
                        {conditions.map((condition) => (
                            <label key={condition.id} className="spell-selector-card">
                                <input
                                    type="checkbox"
                                    checked={activeConditions.includes(condition.id)}
                                    disabled={isSaving}
                                    onChange={() => onToggleCondition(condition.id)}
                                />
                                <span className="spell-selector-copy">
                                    <strong>{condition.name}</strong>
                                    <small>{condition.description}</small>
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div className="detail-panel" role="group" aria-label="Death saves">
                <h3>Death Saves</h3>
                <ul className="detail-list">
                    <li><span>Successes</span><strong>{deathSaves.successes}/3</strong></li>
                    <li><span>Failures</span><strong>{deathSaves.failures}/3</strong></li>
                </ul>
                {Number(character.currentHp) > 0 ? (
                    <p className="status-copy">Death saves are usually tracked at 0 HP.</p>
                ) : null}
                <div className="levelup-actions">
                    <button
                        type="button"
                        className="secondary-action"
                        disabled={isSaving || deathSaves.successes >= 3}
                        onClick={() => onDeathSaveChange({
                            ...deathSaves,
                            successes: clamp(Number(deathSaves.successes) + 1, 0, 3)
                        })}
                    >
                        Success
                    </button>
                    <button
                        type="button"
                        className="secondary-action"
                        disabled={isSaving || deathSaves.failures >= 3}
                        onClick={() => onDeathSaveChange({
                            ...deathSaves,
                            failures: clamp(Number(deathSaves.failures) + 1, 0, 3)
                        })}
                    >
                        Failure
                    </button>
                    <button
                        type="button"
                        className="secondary-action"
                        disabled={isSaving || (deathSaves.successes === 0 && deathSaves.failures === 0)}
                        onClick={() => onDeathSaveChange({ successes: 0, failures: 0 })}
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="detail-panel" role="group" aria-label="Hit dice">
                <h3>Hit Dice</h3>
                <p className="status-copy">{hitDiceRemaining}/{level} {character.hitDie || 'hit dice'}</p>
                <div className="levelup-actions">
                    <button
                        type="button"
                        className="secondary-action"
                        disabled={isSaving || hitDiceRemaining <= 0}
                        onClick={() => onHitDiceChange(hitDiceRemaining - 1)}
                    >
                        Spend
                    </button>
                    <button
                        type="button"
                        className="secondary-action"
                        disabled={isSaving || hitDiceRemaining >= level}
                        onClick={() => onHitDiceChange(level)}
                    >
                        Restore
                    </button>
                </div>
            </div>

            <div className="detail-panel" role="group" aria-label="Inventory">
                <h3>Inventory</h3>
                {inventory.length === 0 ? <p className="status-copy">No inventory items tracked.</p> : null}
                {inventory.length > 0 ? (
                    <ul className="detail-list">
                        {inventory.map((item, index) => (
                            <li key={`${item.name}-${index}`}>
                                <span>{item.name}</span>
                                <strong>{item.quantity}</strong>
                            </li>
                        ))}
                    </ul>
                ) : null}
                <div className="session-inline-form">
                    <label>
                        <span className="detail-label">Item Name</span>
                        <input
                            type="text"
                            value={itemName}
                            onChange={(event) => setItemName(event.target.value)}
                            disabled={isSaving}
                            aria-label="Item name"
                        />
                    </label>
                    <label>
                        <span className="detail-label">Quantity</span>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(event) => setQuantity(event.target.value)}
                            disabled={isSaving}
                            aria-label="Quantity"
                        />
                    </label>
                    <button
                        type="button"
                        className="secondary-action"
                        onClick={addInventoryItem}
                        disabled={isSaving || !itemName.trim()}
                    >
                        Add Item
                    </button>
                </div>
            </div>
        </div>
    );
}
