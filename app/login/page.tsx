import { signIn, signUp } from './actions';

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 lg:flex-row">
      <div className="flex-1 space-y-4">
        <p className="text-sm uppercase tracking-wide text-ink-500">Welcome</p>
        <h1 className="text-3xl font-semibold text-ink-900">Sign in to your listening diary</h1>
        <p className="text-sm text-ink-600">
          Build a timeline of moments, not just ratings. Start with email/password and
          personalize your profile.
        </p>
      </div>
      <div className="card flex-1 space-y-6 p-6">
        <form action={signIn} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Email
            </label>
            <input name="email" type="email" className="input" required />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Password
            </label>
            <input name="password" type="password" className="input" required />
          </div>
          <button className="button w-full" type="submit">
            Sign in
          </button>
        </form>
        <div className="border-t border-ink-800/10 pt-6">
          <p className="text-xs text-ink-500">New here?</p>
          <form action={signUp} className="mt-3 space-y-3">
            <input name="email" type="email" className="input" placeholder="Email" required />
            <input
              name="password"
              type="password"
              className="input"
              placeholder="Password"
              required
            />
            <button className="button-secondary w-full" type="submit">
              Create account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
