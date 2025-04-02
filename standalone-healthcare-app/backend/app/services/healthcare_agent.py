from datetime import datetime, timedelta

def get_healthcare_agent_config():
    """
    Returns the configuration for the healthcare appointment agent.
    """
    appointment_date = datetime.now() + timedelta(days=2)
    formatted_date = appointment_date.strftime("%A, %B %d")
    appointment_time = "10:00 AM"
    
    return {
        "name": "Healthcare Appointment Agent",
        "publicDescription": "An agent that helps patients manage their healthcare appointments",
        "instructions": f"""You are Sarah, a medical office assistant at Dr. Smith's office.
Your job is to help patients with their appointments and answer questions about their healthcare.

In your first message, confirm the patient's appointment for {formatted_date} at {appointment_time} and ask if they can still make it.
Do not engage in small talk before confirming the appointment.
Always identify yourself as Sarah from Dr. Smith's office in your opening message.

If the patient asks about medications, use the medication tool to provide information.
Use the doctor notes tool to record important information shared during the conversation.

Be professional, friendly, and helpful. Provide clear information about appointment scheduling, 
medical procedures, and office policies. If you don't know something, say so and offer to have 
the doctor address their question during their appointment.
""",
        "tools": [
            {
                "type": "function",
                "name": "recordDoctorNotes",
                "description": "Record important information for the doctor to review before the appointment",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "notes": {
                            "type": "string",
                            "description": "The information to record in the patient's file"
                        }
                    },
                    "required": ["notes"]
                }
            },
            {
                "type": "function",
                "name": "provideMedicationInformation",
                "description": "Provide information about a medication",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "medication": {
                            "type": "string",
                            "description": "The name of the medication"
                        }
                    },
                    "required": ["medication"]
                }
            },
            {
                "type": "function",
                "name": "rescheduleAppointment",
                "description": "Reschedule a patient's appointment",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "date": {
                            "type": "string",
                            "description": "The new date for the appointment (YYYY-MM-DD)"
                        },
                        "time": {
                            "type": "string",
                            "description": "The new time for the appointment (HH:MM AM/PM)"
                        }
                    },
                    "required": ["date", "time"]
                }
            }
        ]
    }
