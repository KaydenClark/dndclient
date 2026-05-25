import React from 'react';

import { formatSlug } from './characterFormatters';

// Read-only equipment summary: armor, shield, and equipped weapon names.
export default function EquipmentPanel({ character, attacks }) {
    return (
        <div className="detail-panel">
            <h3>Equipment</h3>
            <ul className="detail-list">
                <li><span>Armor</span><strong>{character.armorId ? formatSlug(character.armorId) : 'None'}</strong></li>
                <li><span>Shield</span><strong>{character.shieldId ? formatSlug(character.shieldId) : 'None'}</strong></li>
                <li><span>Weapons</span><strong>{attacks.length > 0 ? attacks.map((attack) => attack.name).join(', ') : 'None'}</strong></li>
            </ul>
        </div>
    );
}
