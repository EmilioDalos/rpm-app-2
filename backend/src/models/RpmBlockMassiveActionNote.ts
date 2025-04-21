import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import RpmBlockMassiveAction from './RpmBlockMassiveAction';

interface RpmBlockMassiveActionNoteAttributes {
  id: string;
  actionId: string;
  text: string;
  type?: 'progress' | 'remark';
  createdAt: Date;
  updatedAt: Date;
}

interface RpmBlockMassiveActionNoteCreationAttributes extends Omit<RpmBlockMassiveActionNoteAttributes, 'id' | 'massiveActionId' | 'createdAt' | 'updatedAt'> {}

class RpmBlockMassiveActionNote extends Model<RpmBlockMassiveActionNoteAttributes, RpmBlockMassiveActionNoteCreationAttributes> {
  public id!: string;
  public actionId!: string;
  public text!: string;
  public type?: 'progress' | 'remark';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RpmBlockMassiveActionNote.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  actionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: RpmBlockMassiveAction,
      key: 'id'
    },
    field: 'action_id'
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  sequelize,
  modelName: 'RpmBlockMassiveActionNote',
  tableName: 'rpm_block_massive_action_note',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
});

export default RpmBlockMassiveActionNote;