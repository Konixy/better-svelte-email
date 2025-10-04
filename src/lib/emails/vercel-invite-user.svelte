<script lang="ts">
	import {
		Body,
		Button,
		Column,
		Container,
		Head,
		Hr,
		Html,
		Row,
		Section,
		Text
	} from '../components/index.js';

	// Props with default values
	let {
		username = 'alanturing',
		userImage = '/vercel-user.png',
		invitedByUsername = 'Alan',
		invitedByEmail = 'alan.turing@example.com',
		teamName = 'Enigma',
		teamImage = '/vercel-team.png',
		inviteLink = 'https://vercel.com/teams/invite/foo',
		inviteFromIp = '204.13.186.218',
		inviteFromLocation = 'São Paulo, Brazil'
	}: {
		username?: string;
		userImage?: string;
		invitedByUsername?: string;
		invitedByEmail?: string;
		teamName?: string;
		teamImage?: string;
		inviteLink?: string;
		inviteFromIp?: string;
		inviteFromLocation?: string;
	} = $props();

	const previewText = `Join ${invitedByUsername} on Vercel`;
	const baseUrl = '/';
</script>

<Html>
	<Head />
	<Body class="mx-auto my-auto bg-white px-2 font-sans">
		<!-- Preview text -->
		<span class="hidden">{previewText}</span>

		<Container
			data-testid="container"
			class="mx-auto my-10 max-w-[465px] rounded border border-solid border-[#eaeaea] p-5"
		>
			<Section class="mt-8">
				<img
					src="{baseUrl}vercel-logo.png"
					width="40"
					height="37"
					alt="Vercel"
					class="mx-auto my-0"
				/>
			</Section>

			<Text as="h1" class="mx-0 my-[30px] p-0 text-center text-2xl font-normal text-black">
				Join <strong>{teamName}</strong> on <strong>Vercel</strong>
			</Text>

			<Text class="text-sm leading-6 text-black">
				Hello {username},
			</Text>

			<Text class="text-sm leading-6 text-black">
				<strong>{invitedByUsername}</strong>
				(<a href="mailto:{invitedByEmail}" class="text-blue-600 no-underline">
					{invitedByEmail}
				</a>) has invited you to the <strong>{teamName}</strong> team on
				<strong>Vercel</strong>.
			</Text>

			<Section>
				<Row>
					<Column align="right">
						<img
							class="rounded-full"
							src={userImage}
							width="64"
							height="64"
							alt="{username}'s profile picture"
						/>
					</Column>
					<Column align="center">
						<img src="{baseUrl}vercel-arrow.png" width="12" height="9" alt="invited you to" />
					</Column>
					<Column align="left">
						<img
							class="rounded-full"
							src={teamImage}
							width="64"
							height="64"
							alt="{teamName}'s logo"
						/>
					</Column>
				</Row>
			</Section>

			<Section class="mt-8 mb-8 text-center">
				<Button
					class="rounded bg-[#000000] px-5 py-3 text-center text-xs font-semibold text-white no-underline"
					href={inviteLink}
				>
					Join the team
				</Button>
			</Section>

			<Text class="text-sm leading-6 text-black">
				or copy and paste this URL into your browser:
				<a href={inviteLink} class="text-blue-600 no-underline">
					{inviteLink}
				</a>
			</Text>

			<Hr class="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" />

			<Text class="text-xs leading-6 text-[#666666]">
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
