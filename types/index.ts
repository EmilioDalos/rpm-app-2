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
  roles: { name: string }[];
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

export interface MassiveAction {
  id: string; // Unieke ID voor de actie
  text: string; // Beschrijving van de actie
  color?: string; // Optioneel: kleur voor visuele representatie
  leverage: string; // Impact of effect van de actie
  durationAmount: number; // Duur van de actie
  durationUnit: string; // Eenheid van duur: "min", "hour", "day"
  priority: number; // Prioriteit van de actie
  notes: Note[]; // Notities gekoppeld aan de actie
  key: string; // Status zoals "✔" of "pending"
  categoryId: string; // CategoryId voor ook het tonen van de category in de kalender TODO
  startDate?: string; // Optioneel: ISO 8601 datum voor start van de actie
  endDate?: string; // Optioneel: ISO 8601 datum voor einde van de actie
  isDateRange?: boolean; // Of de actie over meerdere dagen gaat
  missedDate?: string; // Datum waarop de actie niet werd opgepakt
  createdAt?: string; // Datum van aanmaak van de actie
  updatedAt?: string; // Laatst bijgewerkt datum

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



