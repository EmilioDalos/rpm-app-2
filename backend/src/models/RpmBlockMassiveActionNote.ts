import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import RpmMassiveActionOccurrence from './RpmMassiveActionOccurrence';

interface RpmBlockMassiveActionNoteAttributes {
  id: string;
  occurrenceId: string;
  text: string;
  type?: 'progress' | 'remark';
  createdAt: Date;
  updatedAt: Date;
}

interface RpmBlockMassiveActionNoteCreationAttributes extends Omit<RpmBlockMassiveActionNoteAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class RpmBlockMassiveActionNote extends Model<RpmBlockMassiveActionNoteAttributes, RpmBlockMassiveActionNoteCreationAttributes> {
  public id!: string;
  public occurrenceId!: string;
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
  occurrenceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: RpmMassiveActionOccurrence,
      key: 'id'
    },
    field: 'occurrence_id'
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