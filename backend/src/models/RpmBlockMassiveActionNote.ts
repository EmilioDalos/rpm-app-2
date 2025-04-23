import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import RpmMassiveActionOccurrence from './RpmMassiveActionOccurrence';

// Define attributes interface with createdAt and updatedAt as optional
interface RpmBlockMassiveActionNoteAttributes {
  id: string;
  occurrenceId: string;
  actionId: string;
  text: string;
  type?: 'progress' | 'remark';
  createdAt?: Date;
  updatedAt?: Date;
}

// Define creation attributes by making certain fields optional
type RpmBlockMassiveActionNoteCreationAttributes = Optional<
  RpmBlockMassiveActionNoteAttributes, 
  'id' | 'createdAt' | 'updatedAt'
>;

class RpmBlockMassiveActionNote extends Model<
  RpmBlockMassiveActionNoteAttributes, 
  RpmBlockMassiveActionNoteCreationAttributes
> {
  public id!: string;
  public occurrenceId!: string;
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
  occurrenceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: RpmMassiveActionOccurrence,
      key: 'id'
    },
    field: 'occurrence_id'
  },
  actionId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'action_id'
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: true,
  }
  // No explicit timestamp fields - handled by Sequelize
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