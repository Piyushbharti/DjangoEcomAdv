from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('recentProduct', '0001_initial'),
    ]

    operations = [
        # RenameField = column ka naam badlo, data waise hi rahega
        migrations.RenameField(
            model_name='recentproductview',
            old_name='user_id',
            new_name='user',
        ),
        # related_name badlne se DB nahi badalta, par Django state mein record hona chahiye
        migrations.AlterField(
            model_name='recentproductview',
            name='user',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='recent_views',
                to='accounts.account',
            ),
        ),
        migrations.AlterField(
            model_name='recentproductview',
            name='product',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='recent_views',
                to='store.product',
            ),
        ),
        migrations.AlterModelOptions(
            name='recentproductview',
            options={'ordering': ['-viewed_at']},
        ),
        migrations.AlterUniqueTogether(
            name='recentproductview',
            unique_together={('user', 'product')},
        ),
    ]
