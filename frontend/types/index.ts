export interface Category {
  id: string;
  name: string;
  type: "personal" | "professional";
  description: string;
  vision: string;
  purpose: string;
  roles: Role[];
  threeToThrive: string[];
  resources: string;
  results: string[];
  color?: string;
  actionPlans: string[];
  imageBlob: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface Role {
  id: string;
  categoryId: string;
  name: string;
  purpose: string;
  description: string;
  coreQualities: string[];
  identityStatement: string;
  incantations: string[];
  imageBlob: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryFormData {
  name: string;
  type: "personal" | "professional";
  description: string;
  vision: string;
  purpose: string;
  roles: { name: string }[];
  threeToThrive: string[];
  resources: string;
  results: string[];
  actionPlans: string[];
  imageBlob?: string;
}

export interface RoleFormData {
  name: string;
  purpose: string;
  description: string;
  coreQualities: string[];
  identityStatement: string;
  reflection: string;
  imageUrl?: string;
}



// Type for the RPM Block
export interface RpmBlock {
  id: string;
  result: string;
  purposes: string[];
  massiveActions: MassiveAction[];
  categoryId: string;
  type: string;
  createdAt?: Date;
  updatedAt?: Date;
  saved?: boolean;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface RecurrencePattern {
  id: string;
  actionId: string;
  dayOfWeek: DayOfWeek;
}

export interface MassiveAction {
  id: string;
  text: string;
  color?: string;
  textColor?: string;
  hour?: number;
  leverage?: string | null;
  durationAmount?: number | null;
  durationUnit?: string | null;
  location?: string | null;
  notes?: Note[];
  startDate?: string;
  endDate?: string;
  actionStatus?: 'new' | 'in_progress' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface Note {
  id: string;
  text: string;
  type?: 'progress' | 'remark'; // Optionele categorisering
  //Het veld type?: 'progress' | 'remark'; is bedoeld als een optionele categorisering van de notities die je toevoegt, zodat je later gemakkelijk onderscheid kunt maken tussen verschillende soorten informatie.
  metrics?: Array<{
    name: string;
    value: number;
    unit?: string;
    timestamp?: string;
    /* TODO implementatie :<div>
  {metrics?.map((metric, index) => (
    <div key={index} className="metric-item">
      <p>{metric.name}: {metric.value} {metric.unit || ''}</p>
      {metric.timestamp && <span>{new Date(metric.timestamp).toLocaleString()}</span>}
    </div>
  ))}
</div> 
*/
  }>;
  createdAt: string;
}

export interface CalendarEvent {
  id: string; // Unieke ID voor de kalendergebeurtenis
  date: string; // ISO 8601 datum waarop de gebeurtenis plaatsvindt
  massiveActions: MassiveAction[]; // Lijst van acties die op deze dag plaatsvinden
  createdAt?: string; // Datum van aanmaak van de gebeurtenis
  updatedAt?: string; // Laatst bijgewerkt datum
}



