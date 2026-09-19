import { Link } from 'react-router-dom';
import { Logo } from '@/components/layout/Logo';
import { PublicFooter } from '@/components/layout/PublicFooter';
import site from '@/config/site.json';

const PRIVACY = [
  ['Who operates the service', 'Optimus Code operates this coding-practice service from India. For privacy questions, access or correction requests, deletion requests, or complaints, contact info@optimusco.de. We may ask you to verify account ownership before acting on a request.'],
  ['Information used to run your account', 'We process your name, email address, timezone, account identifiers, and sign-in information. Google sign-in provides verified profile information, which can include your profile picture. Password-based accounts use password hashes. We also store your practice goals, submissions, assessment answers, code, progress, and subscription status to provide the features you use.'],
  ['Practice, AI, and code execution', 'Assessment generation, grading, and research features may send relevant prompts, submitted answers, or code to configured AI and code-execution providers. Do not submit passwords, API keys, confidential employer material, or other sensitive information in answers, code, or support attachments. Generated material and automated grading can contain errors.'],
  ['Payments and communications', 'Dodo Payments provides hosted subscription checkout and billing. We process billing identifiers and subscription/payment events to manage access and send transactional messages; card-entry details are handled by the payment provider. Our email delivery provider, Brevo, processes recipient information and email content. Billing, security, account, and practice-related messages may be sent as part of the service.'],
  ['Support and profile visibility', 'Problem reports include the text and optional screenshot you submit, your account identity, the page path, and browser information. Remove sensitive details from screenshots before sending them. Your name and practice statistics may be visible to other users on the leaderboard; you can turn leaderboard visibility off in Settings.'],
  ['Cookies, local storage, and analytics', 'Essential browser storage keeps you signed in and remembers settings and this notice. Google sign-in and hosted checkout may use storage needed for their own functionality, subject to those providers’ policies. Optimus Code has not enabled optional analytics or advertising tracking. Clearing browser storage signs you out and resets local preferences. Any future optional tracking will require a separate notice and choice where applicable.'],
  ['Service providers and international processing', 'Hosting, databases, authentication, payment, email, AI, and code-execution services process information needed for their roles. Information may be processed outside India, depending on the providers and infrastructure in use. We may also disclose information where required by law or to address fraud, abuse, or security incidents.'],
  ['Retention and your choices', 'We retain information needed to operate your account, maintain security, handle disputes, and meet applicable legal or accounting obligations. Contact us to request access, correction, or deletion, or to raise a privacy complaint. Some records may need to be retained for legal obligations or legitimate security purposes; we will explain applicable limitations when responding. You can manage billing and leaderboard visibility in Settings.'],
  ['Security and policy changes', 'We use controls such as authenticated API access and encrypted connections. No service can guarantee absolute security. Contact us promptly if you believe your account or information has been compromised. Material changes to how we use information will be reflected in this policy and communicated where required.'],
] as const;

const TERMS = [
  ['Using Optimus Code', 'These terms apply to the Optimus Code service operated from India. By creating an account or using the service, you agree to these terms. If you cannot agree, do not use the service. You must be legally capable of entering this agreement; if parental or guardian permission is required under applicable law, obtain it before using the service. Contact info@optimusco.de with questions.'],
  ['Accounts and security', 'Provide accurate account information, protect your sign-in credentials, and notify us about suspected unauthorized access. You are responsible for activity you authorize on your account. Do not share accounts to bypass access restrictions or misrepresent another person.'],
  ['Free practice and Pro subscriptions', 'DSA practice is available to signed-in users without a Pro subscription. Pro provides the features described on the pricing and checkout pages, including eligible LLD and HLD assessments and coding exercises. Prices, billing intervals, applicable taxes, and any discount conditions are shown before payment. Dodo Payments handles hosted checkout and subscription billing.'],
  ['Renewal, cancellation, and billing questions', 'Subscriptions renew according to the interval and terms shown at checkout unless canceled. Manage your subscription through Settings and the billing portal. Cancellation and the remaining access period follow the subscription terms shown there. Contact info@optimusco.de for failed payments, disputed charges, or refund requests. Refund requests are handled in accordance with applicable law and the relevant payment-provider terms; this page does not create a blanket no-refund rule or promise a refund in every case.'],
  ['Assessments and educational limitations', 'Practice material, AI-generated questions, grading, and test execution are educational tools and can contain mistakes or experience interruptions. Passing an assessment records progress within Optimus Code; it is not a professional certification or a guarantee of interview, employment, or business outcomes. Verify important information independently and report suspected errors.'],
  ['Acceptable use', 'Do not attack the service, attempt unauthorized access, bypass payment or assessment restrictions, automate abusive traffic, or submit malicious code intended to escape the execution environment. Do not upload content that violates another person’s rights or contains sensitive information you are not authorized to share. Reasonable security reports can be sent to our support address.'],
  ['Your submissions and third-party content', 'You retain rights you hold in your original submissions. You allow Optimus Code and its service providers to store and process those submissions as needed to provide requested features such as assessment grading, code execution, and support. Problem statements, links, research references, and third-party materials remain subject to their owners’ rights and terms. Attribution is not a grant of permission to redistribute third-party material.'],
  ['Availability and account restrictions', 'We may update features, perform maintenance, or restrict accounts where reasonably necessary to address abuse, security, or legal requirements. Where practical and appropriate, we will provide notice or an explanation. Nothing in these terms removes statutory consumer rights or excludes liability that cannot lawfully be excluded.'],
  ['Applicable law, concerns, and updates', 'These terms are subject to applicable Indian law, without limiting mandatory rights you may have under other applicable consumer or data-protection laws. Contact info@optimusco.de first so we can try to resolve a concern. We may update these terms as the service changes and will communicate material changes where required.'],
] as const;

export function Legal({ kind }: { kind: 'privacy' | 'terms' }) {
  const privacy = kind === 'privacy';
  const sections = privacy ? PRIVACY : TERMS;
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6">
        <Logo />
        <Link to="/login" className="inline-flex min-h-11 items-center rounded-xl border border-line px-4 text-sm text-ink-muted hover:text-ink">Sign in</Link>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <p className="text-xs uppercase tracking-widest text-brand-pale">{site.name} · {site.country}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{privacy ? 'Privacy policy' : 'Terms & conditions'}</h1>
        <p className="mt-3 text-sm text-ink-muted">Last updated: 20 September 2026</p>
        <div className="mt-10 space-y-9">
          {sections.map(([title, body], index) => (
            <section key={title} aria-labelledby={`legal-section-${index}`}>
              <h2 id={`legal-section-${index}`} className="text-lg font-semibold">{index + 1}. {title}</h2>
              <p className="mt-3 text-sm leading-7 text-ink-muted">{body}</p>
            </section>
          ))}
        </div>
        <p className="mt-10 rounded-xl border border-line bg-card p-5 text-sm leading-7 text-ink-muted">Questions? Email <a href={`mailto:${site.supportEmail}`} className="break-all text-brand-pale underline underline-offset-4">{site.supportEmail}</a>. Read our <Link to={privacy ? '/terms' : '/privacy'} className="text-brand-pale underline underline-offset-4">{privacy ? 'terms & conditions' : 'privacy policy'}</Link>.</p>
      </main>
      <PublicFooter />
    </div>
  );
}
