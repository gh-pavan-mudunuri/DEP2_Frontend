import React from "react";

const TermsAndConditions: React.FC = () => (
  <div className="prose max-w-none text-sm">
    <h2 className="font-bold text-lg mb-2">Terms and Conditions</h2>
    <ol className="list-decimal pl-5 space-y-2">
      <li>You must provide accurate and complete information during registration.</li>
      <li>Tickets are non-transferable and non-refundable unless the event is cancelled by the organizer.</li>
      <li>Entry to the event is subject to verification of your registration and valid identification.</li>
      <li>The organizer reserves the right to make changes to the event schedule or venue.</li>
      <li>Any inappropriate behavior may result in removal from the event without refund.</li>
      <li>By registering, you consent to receive event-related communications via email or phone.</li>
      <li>The organizer is not responsible for any loss, injury, or damage incurred at the event.</li>
      <li>All personal data will be handled in accordance with our privacy policy.</li>
      <li>By registering, you agree to abide by all event rules and instructions from staff.</li>
    </ol>
  </div>
);

export default TermsAndConditions;
