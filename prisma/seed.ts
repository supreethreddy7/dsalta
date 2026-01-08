import { PrismaClient, TaskCategory, TaskStatus, EvidenceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Organization
  let org = await prisma.organization.findFirst({ where: { name: 'Acme Corp' } });
  if (!org) {
    org = await prisma.organization.create({ data: { name: 'Acme Corp' } });
  }

  // Framework
  const framework = await prisma.framework.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'DSALTA' } },
    update: {},
    create: { organizationId: org.id, name: 'DSALTA' },
  });

  // Controls
  const controlAC01 = await prisma.control.upsert({
    where: { frameworkId_code: { frameworkId: framework.id, code: 'AC-01' } },
    update: { title: 'Access Control Policy' },
    create: { frameworkId: framework.id, code: 'AC-01', title: 'Access Control Policy' },
  });

  const controlLOG01 = await prisma.control.upsert({
    where: { frameworkId_code: { frameworkId: framework.id, code: 'LOG-01' } },
    update: { title: 'Audit Logging' },
    create: { frameworkId: framework.id, code: 'LOG-01', title: 'Audit Logging' },
  });

  // Sample task
  let task = await prisma.task.findFirst({
    where: {
      organizationId: org.id,
      controlId: controlAC01.id,
      name: 'Document Access Control Policy',
    },
  });

  if (!task) {
    task = await prisma.task.create({
      data: {
        organizationId: org.id,
        controlId: controlAC01.id,
        name: 'Document Access Control Policy',
        description: 'Create and publish an access control policy for systems handling customer data.',
        category: TaskCategory.POLICY,
        status: TaskStatus.OPEN,
      },
    });

    await prisma.evidence.create({
      data: {
        taskId: task.id,
        type: EvidenceType.DOCUMENT,
        note: 'Draft policy document stored in internal drive (placeholder).',
      },
    });
  }

  console.log('Seed complete ✅');
  console.log({
    organizationId: org.id,
    frameworkId: framework.id,
    controlIds: {
      AC_01: controlAC01.id,
      LOG_01: controlLOG01.id,
    },
    sampleTaskId: task.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
