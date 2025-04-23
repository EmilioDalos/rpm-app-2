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


export interface MassiveAction {
  id: string;
  text: string;
  durationAmount: number;
  durationUnit: 'minutes' | 'hours' | 'days';
  priority: number;
  color: string;
  textColor: string;
  startDate: string;
  endDate: string;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled' | 'planned' | 'leveraged' | 'not_needed' | 'moved';
  leverage?: number;
  location?: string;
  notes?: Note[];
  key?: string;
  hour?: number;
  isDateRange?: boolean;
  selectedDays?: DayOfWeek[];
  missedDate?: string;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
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
  date: string; // ISO 8601 date of the event
  id: string;
  text: string;
  durationAmount: number;
  durationUnit: 'minutes' | 'hours' | 'days';
  priority: number;
  color: string;
  textColor: string;
  startDate: string;
  endDate: string;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled' | 'planned' | 'leveraged' | 'not_needed' | 'moved';
  leverage?: number;
  location?: string;
  notes?: Note[];
  key?: string;
  hour?: number;
  isDateRange?: boolean;
  selectedDays?: DayOfWeek[];
  recurrencePattern?: Array<{id: string, actionId: string, dayOfWeek: DayOfWeek}>;
  missedDate?: string;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents all calendar events for a specific date.
 */
export interface CalendarEventDay {
  /**
   * ISO 8601 date string for the day (e.g. '2025-04-15').
   */
  date: string;

  /**
   * All CalendarEvent entries that occur on this date.
   */
  events: CalendarEvent[];
}
