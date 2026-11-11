import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (getApps().length === 0) {
  initializeApp({ credential: applicationDefault() });
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    throw new Error('Cách dùng: npm run set-admin -- admin@example.com');
  }

  const auth = getAuth();
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, {
    ...user.customClaims,
    admin: true,
  });

  process.stdout.write(`Đã cấp custom claim admin=true cho ${email} (${user.uid}).\n`);
  process.stdout.write('Hãy đăng xuất rồi đăng nhập lại để nhận token mới.\n');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Không thể cấp quyền Admin: ${message}\n`);
  process.exitCode = 1;
});
