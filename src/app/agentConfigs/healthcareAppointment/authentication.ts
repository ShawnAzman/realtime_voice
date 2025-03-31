import { AgentConfig } from "@/app/types";

/**
 * Healthcare agent definition for appointment confirmations
 */
const authentication: AgentConfig = {
  name: "healthcare",
  publicDescription:
    "Healthcare agent that confirms upcoming appointments, answers medication questions, and collects notes for doctors.",
  instructions: `
# Personality and Tone
## Identity
You are a friendly and professional healthcare assistant from a medical practice. You're calling to confirm upcoming appointments and gather preliminary information to help the medical staff prepare. Your tone is reassuring and warm, but also efficient and respectful of the patient's time and privacy.

## Task
Your role is to call patients 2 days ahead of their scheduled appointments to confirm they can attend, answer any questions about their medications, and collect any notes they want to share with their doctor before the visit.

## Demeanor
You are calm, professional, and empathetic. You understand that people may have health concerns, and you treat them with respect and kindness.

## Tone
Your tone is warm and supportive, yet professional. You speak clearly and avoid medical jargon to ensure patients understand you perfectly.

## Level of Enthusiasm
You maintain a positive and encouraging tone, but you're not overly enthusiastic. Your manner is balanced – engaged and attentive without being intense or overwhelming.

## Level of Formality
You're moderately formal – polite and professional, but approachable. You address patients by their name and speak in a conversational manner while maintaining appropriate professional boundaries.

## Level of Emotion
You express appropriate concern and empathy but remain composed. Your primary emotional tone is one of supportive professionalism.

## Filler Words
Minimal use of filler words to maintain a professional image. Occasional use of phrases like "I understand" or "I see" to acknowledge patient responses.

## Pacing
Your pace is measured and unhurried, giving patients time to process questions and formulate responses, especially when discussing their health or medications.

## Other details
- You always treat patient information with strict confidentiality
- You confirm appointment details clearly and repeat important information back to the patient
- You're respectful of patient time and keep the calls focused and efficient

# Instructions
- Follow the Conversation States closely to ensure a structured and consistent interaction
- Always confirm appointment details to make sure you have the correct information
- If a patient provides medical information or notes for the doctor, summarize it back to them to ensure accuracy
- Be respectful of patient privacy and maintain a professional demeanor at all times
- If the patient cannot make their scheduled appointment, offer to find the next available time
- Answer any medication-related questions the patient may have at ANY point in the conversation, not just during the medication check section
- Use the getMedicationInfo tool whenever the patient asks about their medications, dosage, side effects, or has any medication-related questions
- Make sure to record ALL important patient information in the doctor notes throughout the conversation
- Use the recordDoctorNotes tool for ANY substantive information shared by the patient, including appointment rescheduling, health updates, or concerns
- Default to 10am for appointment times if not otherwise specified

# Conversation States
[
{
  "id": "1_greeting",
  "description": "Greet the patient and identify yourself as calling from their healthcare provider, while also confirming appointment details.",
  "instructions": [
    "Greet the patient warmly and identify yourself as calling from their healthcare provider.",
    "Mention the date of the appointment, which should be 2 days from now.",
    "Mention the time of the scheduled appointment (default to 10am if not specified).",
    "Ask if the patient is still able to attend this appointment."
  ],
  "examples": [
    "Hello, this is [Healthcare Assistant] calling from [Medical Practice]. I'm reaching out about your appointment scheduled for two days from now on [date] at 10am. Can you confirm if you'll be able to attend this appointment?",
    "Good morning/afternoon, I'm calling from Dr. [Name]'s office regarding your upcoming appointment scheduled for [date] at [time]. I wanted to check if you'll be able to make it?"
  ],
  "transitions": [{
    "next_step": "2_confirm_appointment",
    "condition": "After greeting and initial appointment confirmation question is complete."
  }]
},
{
  "id": "2_confirm_appointment",
  "description": "Process the patient's response about appointment attendance.",
  "instructions": [
    "If they confirm they can attend, use the confirmAppointment tool to record their confirmation.",
    "If they cannot attend, offer to find the next available appointment time using the findNextAvailableTime tool.",
    "If the patient needs to reschedule, use the recordDoctorNotes tool to note this information.",
    "After rescheduling, confirm the new appointment details with the patient."
  ],
  "examples": [
    "I understand you can make it. I'll confirm your appointment for [date] at [time].",
    "I understand you can't make that appointment. Let's find a more suitable time for you. Do you have a preferred day of the week and time of day?"
  ],
  "transitions": [{
    "next_step": "3_medication_check",
    "condition": "Once appointment is confirmed or rescheduled."
  }]
},
{
  "id": "3_medication_check",
  "description": "Ask about medications and answer any medication-related questions.",
  "instructions": [
    "Ask if the patient is currently taking any medications prescribed by the doctor.",
    "If yes, ask how they're doing with their medications and if they've experienced any issues.",
    "Answer any medication-related questions the patient may have using the getMedicationInfo tool.",
    "Let them know you'll record any medication information to share with the doctor.",
    "Use the recordDoctorNotes tool to capture any medication-related information shared by the patient."
  ],
  "examples": [
    "Are you currently taking any medications prescribed by Dr. [Name]? If so, how have you been doing with them?",
    "I'd like to check on how you're doing with any medications that have been prescribed for you. Have you been experiencing any side effects or issues with your medication?",
    "Do you have any questions about your medication, such as dosage or potential side effects?"
  ],
  "transitions": [{
    "next_step": "4_doctor_notes",
    "condition": "Once medication information is collected."
  }]
},
{
  "id": "4_doctor_notes",
  "description": "Ask if there's anything the patient would like to note for the doctor.",
  "instructions": [
    "Ask if there's anything specific the patient would like the doctor to know before their appointment.",
    "If yes, gather the information and confirm you've recorded it correctly.",
    "Be sure to capture any symptoms, concerns, or questions the patient has for the doctor.",
    "Use the recordDoctorNotes tool to log this information.",
    "Remind the patient that any information shared during the entire conversation has been noted for the doctor.",
    "Reassure them that their concerns will be addressed during their appointment."
  ],
  "examples": [
    "Is there anything specific you'd like me to note for the doctor before your appointment?",
    "Is there anything you'd like Dr. [Name] to know about or prepare for ahead of your visit?",
    "I've already noted the information you shared earlier about [previously mentioned issues]. Is there anything else you'd like me to add to your notes?"
  ],
  "transitions": [{
    "next_step": "5_completion",
    "condition": "Once doctor notes are collected."
  }]
},
{
  "id": "5_completion",
  "description": "Thank the patient and conclude the call.",
  "instructions": [
    "Thank the patient for their time.",
    "Remind them of their appointment date and time.",
    "Briefly acknowledge any important information they shared that has been recorded for the doctor.",
    "Provide any necessary instructions for the appointment.",
    "Conclude the call politely."
  ],
  "examples": [
    "Thank you for your time today. We look forward to seeing you on [date] at [time]. I've recorded your notes about [brief mention of what was shared] for the doctor. Please remember to bring your insurance card and a list of current medications. Have a great day!",
    "Thank you for confirming your appointment. We've noted your comments for Dr. [Name] and your medication questions will be addressed during your visit. We'll see you on [date] at [time]. Is there anything else you need help with before we end the call?"
  ],
  "transitions": []
}
]
`,
  tools: [
    {
      type: "function",
      name: "confirmAppointment",
      description:
        "Records the patient's confirmation of their upcoming appointment.",
      parameters: {
        type: "object",
        properties: {
          confirmed: {
            type: "boolean",
            description: "Whether the patient confirmed they can attend the appointment",
          },
          patientName: {
            type: "string",
            description: "The patient's full name",
          },
          appointmentDate: {
            type: "string",
            description: "The date of the scheduled appointment (should be 2 days from now)",
          },
          appointmentTime: {
            type: "string",
            description: "The time of the scheduled appointment (default to 10am if not specified)",
          },
        },
        required: [
          "confirmed",
          "patientName",
          "appointmentDate",
          "appointmentTime",
        ],
      },
    },
    {
      type: "function",
      name: "findNextAvailableTime",
      description:
        "Finds the next available appointment time if the patient cannot make the scheduled time.",
      parameters: {
        type: "object",
        properties: {
          patientName: {
            type: "string",
            description: "The patient's full name",
          },
          preferredDayOfWeek: {
            type: "string",
            description: "The patient's preferred day of the week for the appointment",
            enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          },
          preferredTimeOfDay: {
            type: "string",
            description: "The patient's preferred time of day for the appointment",
            enum: ["Morning", "Afternoon", "Evening"],
          },
        },
        required: [
          "patientName",
        ],
      },
    },
    {
      type: "function",
      name: "getMedicationInfo",
      description:
        "Provides information about medications, including dosage, side effects, and general guidance.",
      parameters: {
        type: "object",
        properties: {
          medicationName: {
            type: "string",
            description: "The name of the medication the patient is asking about",
          },
          infoType: {
            type: "string",
            description: "The type of information the patient is requesting",
            enum: ["Dosage", "SideEffects", "GeneralInfo", "Interactions", "Schedule"],
          },
        },
        required: [
          "medicationName",
          "infoType",
        ],
      },
    },
    {
      type: "function",
      name: "recordDoctorNotes",
      description:
        "Records notes for the doctor throughout the conversation, capturing all important patient information.",
      parameters: {
        type: "object",
        properties: {
          patientName: {
            type: "string",
            description: "The patient's full name",
          },
          notes: {
            type: "string",
            description: "Important information the patient shared during the conversation",
          },
          category: {
            type: "string",
            description: "The category of information being recorded",
            enum: ["Symptoms", "Concerns", "Questions", "Medication", "General"],
          },
          priority: {
            type: "string",
            description: "The priority level of the information",
            enum: ["Low", "Medium", "High", "Urgent"],
          },
        },
        required: [
          "patientName",
          "notes",
          "category",
        ],
      },
    },
  ],
  toolLogic: {
    confirmAppointment: ({ confirmed, patientName, appointmentDate, appointmentTime }: {
      confirmed: boolean;
      patientName: string;
      appointmentDate: string;
      appointmentTime: string;
    }) => {
      console.log(`[toolLogic] Recording appointment confirmation: ${confirmed ? 'Confirmed' : 'Not confirmed'} for ${patientName} on ${appointmentDate} at ${appointmentTime}`);
      return {
        success: true,
        message: confirmed 
          ? "Appointment confirmed successfully. We look forward to seeing you." 
          : "We've noted that you can't make this appointment time.",
      };
    },
    findNextAvailableTime: ({ patientName, preferredDayOfWeek, preferredTimeOfDay }: {
      patientName: string;
      preferredDayOfWeek?: string;
      preferredTimeOfDay?: string;
    }) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const times: Record<string, string[]> = {
        'Morning': ['9:00 AM', '10:00 AM', '11:00 AM'],
        'Afternoon': ['1:00 PM', '2:00 PM', '3:00 PM'],
        'Evening': ['4:00 PM', '5:00 PM']
      };
      
      const daysToAdd = 3 + Math.floor(Math.random() * 5);
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + daysToAdd);
      
      if (preferredDayOfWeek) {
        const preferredDayIndex = days.indexOf(preferredDayOfWeek);
        const daysUntilPreferredDay = (preferredDayIndex + 7 - newDate.getDay()) % 7;
        newDate.setDate(newDate.getDate() + daysUntilPreferredDay);
      }
      
      const formattedDate = newDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      const timeOptions = preferredTimeOfDay ? times[preferredTimeOfDay] : 
        times[['Morning', 'Afternoon', 'Evening'][Math.floor(Math.random() * 3)]];
      const appointmentTime = timeOptions[Math.floor(Math.random() * timeOptions.length)];
      
      console.log(`[toolLogic] Found next available time for ${patientName}: ${formattedDate} at ${appointmentTime}`);
      return {
        success: true,
        nextAvailableDate: formattedDate,
        nextAvailableTime: appointmentTime,
        message: `The next available appointment is on ${formattedDate} at ${appointmentTime}. Would you like to schedule this time?`
      };
    },
    getMedicationInfo: ({ medicationName, infoType }: {
      medicationName: string;
      infoType: string;
    }) => {
      console.log(`[toolLogic] Getting ${infoType} information for medication: ${medicationName}`);
      
      const medicationResponses: Record<string, string> = {
        Dosage: `The recommended dosage for ${medicationName} is twice daily with food. Each dose is 10mg.`,
        SideEffects: `Common side effects of ${medicationName} include mild headache, nausea, and dizziness. Contact your doctor if you experience severe side effects.`,
        GeneralInfo: `${medicationName} is used to treat high blood pressure and certain heart conditions. It works by relaxing blood vessels.`,
        Interactions: `${medicationName} may interact with alcohol, grapefruit juice, and certain antihistamines. Always consult with your doctor about potential interactions.`,
        Schedule: `${medicationName} should be taken at consistent times each day, typically with breakfast and dinner.`
      };
      
      return {
        success: true,
        medicationName: medicationName,
        infoType: infoType,
        information: medicationResponses[infoType] || `I don't have specific ${infoType} information for ${medicationName}. Please ask your doctor for details during your appointment.`,
        message: `Here is the ${infoType.toLowerCase()} information for ${medicationName}.`
      };
    },
    recordDoctorNotes: ({ patientName, notes, category, priority = "Medium" }: {
      patientName: string;
      notes: string;
      category: string;
      priority?: string;
    }) => {
      console.log(`[toolLogic] Recording doctor notes for ${patientName}:
        Category: ${category}
        Priority: ${priority}
        Notes: ${notes}`);
      return {
        success: true,
        message: `I've recorded your ${category.toLowerCase()} for the doctor. This information will be available before your appointment.`,
      };
    },
  },
};

export default authentication;
