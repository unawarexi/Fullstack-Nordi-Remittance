// ============================================================================
// IVR BANKING SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mic,
  Hash,
  ArrowRight,
  Check,
  Shield,
  Clock,
  Volume2,
  Languages,
  HelpCircle,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// IVR SERVICES
// ========================
interface IVRService {
  code: string;
  name: string;
  description: string;
}

const ivrServices: IVRService[] = [
  { code: "1", name: "Account Balance", description: "Check your account balance instantly" },
  { code: "2", name: "Mini Statement", description: "Get your last 5 transactions" },
  { code: "3", name: "Fund Transfer", description: "Transfer to any bank account" },
  { code: "4", name: "Airtime Purchase", description: "Buy airtime for any network" },
  { code: "5", name: "Bill Payment", description: "Pay utilities and subscriptions" },
  { code: "6", name: "Card Services", description: "Block, unblock, or request a card" },
  { code: "7", name: "Loan Status", description: "Check loan balance and status" },
  { code: "0", name: "Speak to Agent", description: "Connect with customer service" },
];

// ========================
// FEATURES
// ========================
const features = [
  { icon: Clock, label: "24/7 Available", desc: "Bank anytime, day or night" },
  { icon: Languages, label: "Multi-Language", desc: "English, Yoruba, Hausa, Igbo" },
  { icon: Shield, label: "Secure PIN", desc: "Protected by your unique PIN" },
  { icon: Volume2, label: "Voice Guided", desc: "Easy audio instructions" },
];

// ========================
// MAIN COMPONENT
// ========================
const IVRBanking: React.FC = () => {
  return (
    <Section id="ivr" className="py-16 lg:py-24 bg-slate-50">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-sm font-medium mb-4">
              <Phone className="w-4 h-4" />
              IVR Banking
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Bank with Just a Phone Call
            </h2>
            <p className="text-lg text-neutral-600 mb-6">
              No internet? No smartphone? No problem! Access all your banking 
              services by simply calling our Interactive Voice Response line.
            </p>

            {/* Phone Number */}
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-rose-600 font-medium">Call Our IVR Line</p>
                  <p className="text-2xl font-bold text-neutral-900">0700-REMIT-00</p>
                  <p className="text-sm text-neutral-500">Or dial 0700-736-4800</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {features.map((feature) => (
                <div key={feature.label} className="flex items-start gap-2 p-3 rounded-lg bg-white border border-neutral-200">
                  <feature.icon className="w-5 h-5 text-rose-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-neutral-900 text-sm">{feature.label}</p>
                    <p className="text-xs text-neutral-500">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="primary" className="bg-rose-600 hover:bg-rose-700">
              <Mic className="w-4 h-4 mr-2" />
              Register for IVR Banking
            </Button>
          </motion.div>

          {/* IVR Menu */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {/* Phone Mockup */}
            <div className="relative max-w-xs mx-auto">
              <div className="bg-neutral-900 rounded-[2rem] p-3 shadow-2xl">
                <div className="bg-neutral-800 rounded-[1.5rem] p-4">
                  {/* Phone Header */}
                  <div className="text-center mb-4">
                    <p className="text-neutral-400 text-xs">Incoming Call</p>
                    <p className="text-white font-bold">0700-REMIT-00</p>
                    <p className="text-emerald-400 text-xs">Connected</p>
                  </div>

                  {/* IVR Menu */}
                  <div className="p-3 rounded-xl bg-neutral-700/50 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Volume2 className="w-4 h-4 text-rose-400" />
                      <span className="text-white text-xs">Welcome to Remit Bank</span>
                    </div>
                    <p className="text-neutral-300 text-xs">
                      Please select an option from the menu below...
                    </p>
                  </div>

                  {/* Menu Options */}
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {ivrServices.map((service) => (
                      <div
                        key={service.code}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg",
                          "bg-neutral-700/30 hover:bg-neutral-700/50 transition-colors"
                        )}
                      >
                        <div className="w-7 h-7 rounded-lg bg-rose-600/30 text-rose-400 flex items-center justify-center text-xs font-bold">
                          {service.code}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-xs font-medium">{service.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Keypad Hint */}
                  <div className="mt-3 pt-3 border-t border-neutral-600">
                    <div className="grid grid-cols-3 gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((key) => (
                        <div
                          key={key}
                          className="h-8 rounded bg-neutral-600 flex items-center justify-center text-white text-xs font-medium"
                        >
                          {key}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow */}
              <div className="absolute -inset-4 -z-10 bg-rose-500/20 rounded-[3rem] blur-2xl" />
            </div>
          </motion.div>
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Quick Tips</p>
                <ul className="text-sm text-amber-700 mt-1 space-y-1">
                  <li>• Have your account number and PIN ready</li>
                  <li>• Speak clearly when voice prompts ask for input</li>
                  <li>• Press * to repeat any menu option</li>
                  <li>• Press 0 at any time to speak with an agent</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default IVRBanking;
