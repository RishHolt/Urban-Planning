import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }

        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">GoServePH Terms of Service Agreement</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="px-6 py-4 space-y-4 text-sm leading-6">
                    <p><strong>Welcome to Urban Planning!</strong></p>
                    <p>This Urban Planning Services Agreement ("Agreement") is a binding legal contract for the use of our software systems—which handle data input, monitoring, processing, and analytics—("Services") between Urban Planning ("us," "our," or "we") and you, the registered user ("you" or "user").</p>
                    <p>This Agreement details the terms and conditions for using our Services. By accessing or using any Urban Planning Services, you agree to these terms. If you don't understand any part of this Agreement, please contact us at info@urbanplanning.gov.ph.</p>
                    
                    <h4 className="font-semibold">OVERVIEW OF THIS AGREEMENT</h4>
                    <p>This document outlines the terms for your use of the Urban Planning system:</p>
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr><th className="py-1 pr-4">Section</th><th className="py-1">Topic</th></tr>
                        </thead>
                        <tbody>
                            <tr><td className="py-1 pr-4">Section A</td><td className="py-1">General Account Setup and Use</td></tr>
                            <tr><td className="py-1 pr-4">Section B</td><td className="py-1">Technology, Intellectual Property, and Licensing</td></tr>
                            <tr><td className="py-1 pr-4">Section C</td><td className="py-1">Payment Terms, Fees, and Billing</td></tr>
                            <tr><td className="py-1 pr-4">Section D</td><td className="py-1">Data Usage, Privacy, and Security</td></tr>
                            <tr><td className="py-1 pr-4">Section E</td><td className="py-1">Additional Legal Terms and Disclaimers</td></tr>
                        </tbody>
                    </table>
                    
                    <h4 className="font-semibold">SECTION A: GENERAL TERMS</h4>
                    <p><strong>1. Your Account and Registration</strong></p>
                    <p>a. Account Creation: To use our Services, you must create an Account. Your representative (Representative) must provide us with required details, including your entity's name, address, contact person, email, phone number, relevant ID/tax number, and the nature of your business/activities.</p>
                    <p>b. Review and Approval: We reserve the right to review and approve your application, which typically takes at least two (2) business days. We can deny or reject any application at our discretion.</p>
                    <p>c. Eligibility: Only businesses, institutions, and other entities based in the Philippines are eligible to apply for an Urban Planning Account.</p>
                    <p>d. Representative Authority: You confirm that your Representative has the full authority to provide your information and legally bind your entity to this Agreement. We may ask for proof of this authority.</p>
                    <p>e. Validation: We may require additional documentation at any time (e.g., business licenses, IDs) to verify your entity's ownership, control, and the information you provided.</p>
                    
                    <p><strong>2. Services and Support</strong></p>
                    <p>We provide support for general account inquiries and issues that prevent the proper use of the system ("System Errors"). Support includes resources available through our in-app Ticketing System and website documentation ("Documentation"). For further questions, contact us at support@urbanplanning.gov.ph.</p>
                    
                    <p><strong>3. Service Rules and Restrictions</strong></p>
                    <p>a. Lawful Use: You must use the Services lawfully and comply with all applicable Philippine laws, rules, and regulations ("Laws") regarding your use of the Services and the transactions you facilitate ("Transactions").</p>
                    <p>b. Prohibited Activities: You may not use the Services to facilitate illegal transactions, or for personal/household use. Specifically, you must not, nor allow others to:</p>
                    <ul className="list-disc pl-5">
                        <li>Access non-public systems or data.</li>
                        <li>Copy, resell, or distribute the Services, Documentation, or system content.</li>
                        <li>Use, transfer, or access data you do not own or have no documented rights to use.</li>
                        <li>Act as a service agent for the Services.</li>
                        <li>Transfer your rights under this Agreement.</li>
                        <li>Bypass technical limitations or enable disabled features.</li>
                        <li>Reverse engineer the Services (except where legally permitted).</li>
                        <li>Interfere with the normal operation of the Services or impose an unreasonably large load on the system.</li>
                    </ul>
                    
                    <p><strong>4. Electronic Notices and Consent</strong></p>
                    <p>a. Electronic Consent: By registering, you provide your electronic signature and consent to receive all notices and disclosures from us electronically (via our website, email, or text message), which has the same legal effect as a physical signature.</p>
                    <p>b. Delivery: We are not liable for non-receipt of notices due to issues beyond our control (e.g., network outages, incorrect contact details, firewall restrictions). Notices posted or emailed are considered received within 24 hours.</p>
                    <p>c. Text Messages: You authorize us to use text messages to verify your account control (like two-step verification) and provide critical updates. Standard carrier charges may apply.</p>
                    <p>d. Withdrawing Consent: You can withdraw your consent to electronic notices only by terminating your Account.</p>
                    
                    <p><strong>5. Termination</strong></p>
                    <p>a. Agreement Term: This Agreement starts upon registration and continues until terminated by you or us.</p>
                    <p>b. Termination by You: You can terminate by emailing a closure request to info@urbanplanning.gov.ph. Your Account will be closed within 120 business days of receipt.</p>
                    <p>c. Termination by Us: We may terminate this Agreement, suspend your Account, or close it at any time, for any reason, by providing you notice. Immediate suspension or termination may occur if:</p>
                    <ul className="list-disc pl-5">
                        <li>You pose a significant fraud or credit risk.</li>
                        <li>You use the Services in a prohibited manner or violate this Agreement.</li>
                        <li>Law requires us to do so.</li>
                    </ul>
                    <p>d. Effect of Termination: Upon termination:</p>
                    <ul className="list-disc pl-5">
                        <li>All licenses granted to you end.</li>
                        <li>We may delete your data and information (though we have no obligation to do so).</li>
                        <li>We are not liable to you for any damages related to the termination, suspension, or data deletion.</li>
                        <li>You remain liable for any outstanding fees, fines, or financial obligations incurred before termination.</li>
                    </ul>
                    
                    <h4 className="font-semibold">SECTION B: TECHNOLOGY</h4>
                    <p><strong>1. System Access and Updates</strong></p>
                    <p>We provide access to the web system and/or mobile application ("Application"). You must only use the Application as described in the Documentation. We will update the Application and Documentation periodically, which may add or remove features, and we will notify you of material changes.</p>
                    
                    <p><strong>2. Ownership of Intellectual Property (IP)</strong></p>
                    <p>a. Your Data: You retain ownership of all your master data, raw transactional data, and generated reports gathered from the system.</p>
                    <p>b. Urban Planning IP: We exclusively own all rights, titles, and interests in the patents, copyrights, trademarks, system designs, and documentation ("Urban Planning IP"). All rights in Urban Planning IP not expressly granted to you are reserved by us.</p>
                    <p>c. Ideas: If you submit comments or ideas for system improvements ("Ideas"), you agree that we are free to use these Ideas without any attribution or compensation to you.</p>
                    
                    <p><strong>3. License Coverage</strong></p>
                    <p>We grant you a non-exclusive and non-transferable license to electronically access and use the Urban Planning IP only as described in this Agreement. We are not selling the IP to you, and you cannot sublicense it. We may revoke this license if you violate the Agreement.</p>
                    
                    <p><strong>4. References to Our Relationship</strong></p>
                    <p>During the term of this Agreement, both you and we may publicly identify the other party as the service provider or client, respectively. If you object to us identifying you as a client, you must notify us at info@urbanplanning.gov.ph. Upon termination, both parties must remove all public references to the relationship.</p>
                    
                    <h4 className="font-semibold">SECTION C: PAYMENT TERMS AND CONDITIONS</h4>
                    <p><strong>1. Service Fees</strong></p>
                    <p>We will charge the Fees for set-up, access, support, penalties, and other transactions as described on the Urban Planning website. We may revise the Fees at any time, with at least 30 days' notice before the revisions apply to you.</p>
                    
                    <p><strong>2. Payment Terms and Schedule</strong></p>
                    <p>a. Billing: Your monthly bill for the upcoming month is generated by the system on the 21st day of the current month and is due after 5 days. Billing is based on the number of registered users ("End-User") as of the 20th day.</p>
                    <p>b. Payment Method: All payments must be settled via our third-party Payment System Provider, PayPal. You agree to abide by all of PayPal's terms, and we are not responsible for any issues with their service.</p>
                    
                    <p><strong>3. Taxes</strong></p>
                    <p>Fees exclude applicable taxes. You are solely responsible for remitting all taxes for your business to the appropriate Philippine tax and revenue authorities.</p>
                    
                    <p><strong>4. Payment Processing</strong></p>
                    <p>We are not a bank and do not offer services regulated by the Bangko Sentral ng Pilipinas. We reserve the right to reject your application or terminate your Account if you are ineligible to use PayPal services.</p>
                    
                    <p><strong>5. Processing Disputes and Refunds</strong></p>
                    <p>You must report disputes and refund requests by emailing us at billing@urbanplanning.gov.ph. Disputes will only be investigated if reported within 60 days from the billing date. If a refund is warranted, it will be issued as a credit memo for use on future bills.</p>
                    
                    <h4 className="font-semibold">SECTION D: DATA USAGE, PRIVACY AND SECURITY</h4>
                    <p><strong>1. Data Usage Overview</strong></p>
                    <p>Data security is a top priority. This section outlines our obligations when handling information.</p>
                    <p>'PERSONAL DATA' is information that relates to and can identify a person.</p>
                    <p>'USER DATA' is information that describes your business, operations, products, or services.</p>
                    <p>'Urban Planning DATA' is transactional data over our infrastructure, fraud analysis info, aggregated data, and other information originating from the Services.</p>
                    <p>'DATA' means all of the above.</p>
                    <p>We use Data to provide Services, mitigate fraud, and improve our systems. We do not provide Personal Data to unaffiliated parties for marketing purposes.</p>
                    
                    <p><strong>2. Data Protection and Privacy</strong></p>
                    <p>a. Confidentiality: You will protect all Data received via the Services and only use it in connection with this Agreement. Neither party may use Personal Data for marketing without express consent. We may disclose Data if required by legal instruments (e.g., subpoena).</p>
                    <p>b. Privacy Compliance: You affirm that you comply with all Laws governing the privacy and protection of the Data you provide to or access through the Services. You are responsible for obtaining all necessary consents from End-Users to allow us to collect, use, and disclose their Data.</p>
                    <p>c. Data Processing Roles: You shall be the data controller, and we shall be the data intermediary. We will process the Personal Data only according to this Agreement and will implement appropriate measures to protect it.</p>
                    <p>d. Data Mining: You may not mine the database or any part of it without our express consent.</p>
                    
                    <p><strong>3. Security Controls</strong></p>
                    <p>We are responsible for protecting your Data using commercially reasonable administrative, technical, and physical security measures. However, no system is impenetrable. You agree that you are responsible for implementing your own firewall, anti-virus, anti-phishing, and other security measures ("Security Controls"). We may suspend your Account to maintain the integrity of the Services, and you waive the right to claim losses that result from such actions.</p>
                    
                    <h4 className="font-semibold">SECTION E: ADDITIONAL LEGAL TERMS</h4>
                    <p><strong>1. Right to Amend</strong></p>
                    <p>We can change or add to these terms at any time by posting the changes on our website. Your continued use of the Services constitutes your acceptance of the modified Agreement.</p>
                    
                    <p><strong>2. Assignment</strong></p>
                    <p>You cannot assign this Agreement or your Account rights to anyone else without our prior written consent. We can assign this Agreement without your consent.</p>
                    
                    <p><strong>3. Force Majeure</strong></p>
                    <p>Neither party will be liable for delays or non-performance caused by events beyond reasonable control, such as utility failures, acts of nature, or war. This does not excuse your obligation to pay fees.</p>
                    
                    <p><strong>4. Representations and Warranties</strong></p>
                    <p>By agreeing, you warrant that:</p>
                    <ul className="list-disc pl-5">
                        <li>You are eligible to use the Services and have the authority to enter this Agreement.</li>
                        <li>All information you provide is accurate and complete.</li>
                        <li>You will comply with all Laws.</li>
                        <li>You will not use the Services for fraudulent or illegal purposes.</li>
                    </ul>
                    
                    <p><strong>5. No Warranties</strong></p>
                    <p>We provide the Services and Urban Planning IP "AS IS" and "AS AVAILABLE," without any express, implied, or statutory warranties of title, merchantability, fitness for a particular purpose, or non-infringement.</p>
                    
                    <p><strong>6. Limitation of Liability</strong></p>
                    <p>We shall not be responsible or liable to you for any indirect, punitive, incidental, special, consequential, or exemplary damages resulting from your use or inability to use the Services, lost profits, personal injury, or property damage. We are not liable for damages arising from:</p>
                    <ul className="list-disc pl-5">
                        <li>Hacking, tampering, or unauthorized access to your Account.</li>
                        <li>Your failure to implement Security Controls.</li>
                        <li>Use of the Services inconsistent with the Documentation.</li>
                        <li>Bugs, viruses, or interruptions to the Services.</li>
                    </ul>
                    
                    <p>This Agreement and all incorporated policies constitute the entire agreement between you and Urban Planning.</p>
                </div>
                
                <div className="border-t px-6 py-3 flex justify-end">
                    <Button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-secondary text-white"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
