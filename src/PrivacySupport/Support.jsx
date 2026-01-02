import "../MedicalHistory/MHPS.css"
export default function Support(){
    return (
        <div className="support">
            <div className="header">
                <h1>Support</h1>
                <p>Help, guidance, and safety information for using CureOn</p>
            </div>
            <main>
                <p><strong>Email Support: </strong> <a href="mailto:akshayanvishaalb@gmail.com">support@cureon.com</a></p>
                <p><strong>Phone: </strong>93601 93992</p>
            </main>
            <section className="notice">       
                <h3>Emergency Notice</h3>
                <p>
                    CureOn does not provide emergency medical services.
                    If you believe you are experiencing a medical emergency,
                    contact local emergency services immediately.
                </p>
            </section>
            <hr></hr>
            <hr></hr>
            <section className="faqs">
                <h2>Frequently Asked Questions (FAQs)</h2>

                <h3>1. About CureOn</h3>
                <p><strong>What is CureOn?</strong><br />
                CureOn is a digital health advisor that helps users assess symptoms,
                understand potential health risks, and track medical information.
                </p>

                <p><strong>Is CureOn a doctor?</strong><br />
                No. CureOn does not replace licensed medical professionals.
                </p>
                <hr></hr>
                <h3>2. Symptom Analysis</h3>
                <p><strong>How does symptom analysis work?</strong><br />
                CureOn evaluates user-provided information using health logic models
                to offer general guidance and next-step recommendations.
                </p>

                <p><strong>Is this a diagnosis?</strong><br />
                No. Results are informational only and are not medical diagnoses.
                </p>
                <hr></hr>

                <h3>3. Medical Tracking</h3>
                <p><strong>What can I track?</strong></p>
                <ul>
                <li>Symptoms</li>
                <li>Medications</li>
                <li>Medical history</li>
                <li>Appointments & Hospital Visits</li>
                <li>Personal notes</li>
                </ul>

                <p><strong>Can I share my data?</strong><br />
                Yes. You can export selected data in [PDF / CSV / other format].
                </p>
                <hr></hr>

                <h3>4. Account & Access</h3>
                <p><strong>How do I delete my account?</strong><br />
                Follow the steps in the app or contact support.
                </p>

                <p><strong>Forgot password?</strong><br />
                Use the “Forgot Password” option on the login screen.
                </p>
            </section>
            <hr></hr>
            <hr></hr>
            

            <section>
                <h2>Medical & Safety Disclaimer</h2>
                <p>
                    CureOn is intended for informational and educational purposes only.
                    It does not diagnose conditions, prescribe treatment, or replace
                    professional medical advice.
                </p>
                <p>
                   <strong>Always consult a qualified healthcare provider for medical concerns.</strong>
                </p>
            </section>
            <hr></hr>
            <hr></hr>
             <section className="troubleshooting">
                <h2>Troubleshooting</h2>
                <ul>
                <li>Restart the app</li>
                <li>Check for updates</li>
                <li>Ensure internet connectivity</li>
                <li>Contact support if issues persist</li>
                </ul>
            </section>
            <footer>
                <p>
                    Last Updated: December 2025<br />
                    <strong>© 2025 CureOn. All rights reserved.</strong>
                </p>
            </footer>

        </div>
    );
}