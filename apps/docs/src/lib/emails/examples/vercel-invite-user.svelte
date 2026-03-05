<script lang="ts">
	import {
		Body,
		Button,
		Column,
		Container,
		Head,
		Heading,
		Hr,
		Html,
		Img,
		Link,
		Preview,
		Row,
		Section,
		Text
	} from '@better-svelte-email/components';

	interface Props {
		username?: string;
		userImage?: string;
		invitedByUsername?: string;
		invitedByEmail?: string;
		teamName?: string;
		teamImage?: string;
		inviteLink?: string;
		inviteFromIp?: string;
		inviteFromLocation?: string;
	}

	let {
		username = 'alanturing',
		userImage = 'vercel-user.png',
		invitedByUsername = 'Alan',
		invitedByEmail = 'alan.turing@example.com',
		teamName = 'Enigma',
		teamImage = 'vercel-team.png',
		inviteLink = 'https://vercel.com',
		inviteFromIp = '204.13.186.218',
		inviteFromLocation = 'São Paulo, Brazil'
	}: Props = $props();

	const baseUrl =
		process.env.VERCEL === '1'
			? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
			: 'http://localhost:5173';

	// svelte-ignore state_referenced_locally
	const previewText = `Join ${invitedByUsername} on Vercel`;
</script>

<Html>
	<Head />
	<Body class="mx-auto my-auto bg-white px-2 font-sans">
		<Preview preview={previewText} />
		<Container
			class="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]"
		>
			<Section class="mt-[32px]">
				<Img
					src="{baseUrl}/vercel-logo.png"
					width="40"
					height="37"
					alt="Vercel Logo"
					class="mx-auto my-0"
				/>
			</Section>
			<Heading as="h1" class="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
				Join <strong>{teamName}</strong> on <strong>Vercel</strong>
			</Heading>
			<Text class="text-[14px] leading-[24px] text-black">
				Hello {username},
			</Text>
			<Text class="text-[14px] leading-[24px] text-black">
				<strong>{invitedByUsername}</strong> (<Link
					href={`mailto:${invitedByEmail}`}
					class="text-blue-600 no-underline"
				>
					{invitedByEmail}
				</Link>) has invited you to the <strong>{teamName}</strong> team on
				<strong>Vercel</strong>.
			</Text>
			<Section>
				<Row>
					<Column align="right">
						<Img
							class="rounded-full"
							src="{baseUrl}/{userImage}"
							width="64"
							height="64"
							alt={`${username}'s profile picture`}
						/>
					</Column>
					<Column align="center">
						<Img
							src="{baseUrl}/vercel-arrow.png"
							width="12"
							height="9"
							alt="Arrow indicating invitation"
						/>
					</Column>
					<Column align="left">
						<Img
							class="rounded-full"
							src="{baseUrl}/{teamImage}"
							width="64"
							height="64"
							alt={`${teamName} team logo`}
						/>
					</Column>
				</Row>
			</Section>
			<Section class="mt-[32px] mb-[32px] text-center">
				<Button
					class="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
					href={inviteLink}
				>
					Join the team
				</Button>
			</Section>
			<Text class="text-[14px] leading-[24px] text-black">
				or copy and paste this URL into your browser:
				<Link href={inviteLink} class="text-blue-600 no-underline">
					{inviteLink}
				</Link>
			</Text>
			<Hr class="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />
			<Text class="text-[12px] leading-[24px] text-[#666666]">
				This invitation was intended for
				<span class="text-black">{username}</span>. This invite was sent from
				<span class="text-black">{inviteFromIp}</span>
				located in
				<span class="text-black">{inviteFromLocation}</span>. If you were not expecting this
				invitation, you can ignore this email. If you are concerned about your account's safety,
				please reply to this email to get in touch with us.
			</Text>
		</Container>
	</Body>
</Html>
